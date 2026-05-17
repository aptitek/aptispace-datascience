-- _extensions/aptitek/filetree/filetree.lua

local function get_icon(filename)
    local ext = filename:match("^.+(%..+)$")
    if not ext then return "bi-file-earmark" end
    ext = ext:lower()

    if ext == ".ipynb" then return "bi-journal-code"
    elseif ext == ".png" or ext == ".jpg" or ext == ".jpeg" or ext == ".gif" or ext == ".svg" then return "bi-file-earmark-image"
    elseif ext == ".pdf" then return "bi-file-earmark-pdf"
    elseif ext == ".py" or ext == ".java" or ext == ".js" or ext == ".ts" or ext == ".html" or ext == ".css" or
        ext == ".scss" or ext == ".json" or ext == ".xml" or ext == ".qmd" or ext == ".md" or ext == ".yml" then return "bi-file-earmark-code"
    else return "bi-file-earmark" end
end

local function get_href(path, filename)
    local ext = filename:match("^.+(%..+)$")
    if not ext then return path end
    ext = ext:lower()

    -- Ensure path starts with / if it doesn't (assuming relative to root for viewer)
    -- But Quarto resolves links. Let's assume the user provided path is correct for now.
    -- We might need to prefix with / if it's relative and viewer is at /assets/viewer.html

    local web_path = path
    if path:sub(1, 1) ~= "/" then
        web_path = "/" .. path
    end

    local is_binary = false
    local f = io.open(path, "rb")
    if f then
        local bytes = f:read(1024)
        if bytes and bytes:find("\0") then
            is_binary = true
        end
        f:close()
    end

    if ext == ".ipynb" then
        -- Treat as fully rendered HTML file (Quarto renders .ipynb to .html)
        -- We want to show it statically in viewer.html
        local html_path = web_path:gsub("%.ipynb$", ".html")
        -- URL encode path just in case
        local safe_path = html_path:gsub(" ", "%20")
        return "/assets/viewer.html#file=" .. safe_path .. "&mode=render"

    elseif is_binary == false then
        -- Use static viewer
        -- Need to URL encode the path
        -- Lua doesn't have built-in urlencode, doing simple one or minimal
        -- Since we don't have python's urllib, we hope path is simple or we use pandoc's util if available?
        -- Only minimal replacements: space to %20
        local safe_path = web_path:gsub(" ", "%20")
        return "/assets/viewer.html#file=" .. safe_path

    else
        -- Direct link (Images, PDF, etc)
        return web_path
    end
end

local function split_name_desc(text)
    local name, desc = text:match("^([^%(]+)(.*)$")
    if not name then
        name = text
        desc = ""
    end
    -- Trim whitespace
    name = name:gsub("^%s*(.-)%s*$", "%1")
    desc = desc:gsub("^%s*(.-)%s*$", "%1")
    return name, desc
end

local function format_item_html(name, desc, icon_class, is_link, url, frame_name, container_id)
    local desc_html = ""
    if desc ~= "" then
        desc_html = string.format(' <span class="filetree-comment">%s</span>', desc)
    end
    
    local name_html = string.format('<span class="filetree-name">%s</span>', name)
    
    if is_link then
        return string.format(
            '<li class="file"><a href="#" class="filetree-link" data-url="%s" data-frame="%s" data-container="%s"><i class="bi %s file-icon"></i> %s%s</a></li>',
            url, frame_name, container_id, icon_class, name_html, desc_html
        )
    else
        local li_class = "file-leaf"
        local icon_color_class = "file-icon"
        -- If it represents a directory
        if name:find("/$") then
            li_class = "folder-leaf"
            icon_color_class = "folder-icon"
        end
        return string.format(
            '<li class="%s"><span><i class="bi %s %s"></i> %s%s</span></li>',
            li_class, icon_class, icon_color_class, name_html, desc_html
        )
    end
end

local function render_item(item, frame_name, container_id)
    -- Item is a Block (Plain or Para) containing Link or Str
    -- or a BulletList (subfolder)

    local blocks = item
    local is_folder = false
    local link = nil
    local sublist = nil
    local text = ""

    for _, block in ipairs(blocks) do
        if block.t == "BulletList" then
            is_folder = true
            sublist = block
        elseif block.t == "Para" or block.t == "Plain" then
            text = pandoc.utils.stringify(block)
            pandoc.walk_block(block, {
                Link = function(el) link = el end
            })
        end
    end

    if is_folder then
        local content = ""
        local folder_name = text
        if link then folder_name = pandoc.utils.stringify(link.content) end
        if folder_name == "" then folder_name = "Folder" end

        local f_name, f_desc = split_name_desc(folder_name)
        local desc_html = ""
        if f_desc ~= "" then
            desc_html = string.format(' <span class="filetree-comment">%s</span>', f_desc)
        end
        local name_html = string.format('<span class="filetree-name">%s</span>', f_name)

        content = content ..
            '<li class="folder"><details open><summary><i class="bi bi-chevron-right folder-arrow"></i><i class="bi bi-folder-fill folder-icon"></i> '
            .. name_html .. desc_html .. '</summary><ul>'

        if sublist then
            for _, child_item in ipairs(sublist.content) do
                content = content .. render_item(child_item, frame_name, container_id)
            end
        end

        content = content .. '</ul></details></li>'
        return content
    else
        -- Leaf node (File or empty Directory)
        if not link then
            local is_dir = text:find("/%s") or text:find("/$")
            local f_name, f_desc = split_name_desc(text)
            local icon = is_dir and "bi-folder-fill" or "bi-file-earmark"
            
            if not is_dir then
                -- Try to extract extension from first word
                local first_word = f_name:match("^%s*([^%s]+)") or f_name
                icon = get_icon(first_word)
            end
            
            return format_item_html(f_name, f_desc, icon, false, nil, nil, nil)
        end

        local path = link.target
        local f_name, f_desc = split_name_desc(text)
        if f_name == "" then f_name = path:match("^.+/(.+)$") or path end

        local is_dir = f_name:find("/$") or path:find("/$")
        local icon = is_dir and "bi-folder-fill" or get_icon(path)
        local final_url = get_href(path, f_name)

        return format_item_html(f_name, f_desc, icon, true, final_url, frame_name, container_id)
    end
end

local function generate_zip(zip_path, source_dir)
    -- zip_path: where to save the zip (e.g., "_site/lab/TP1.zip")
    -- source_dir: what to zip (e.g., "lab/TP1")

    -- Ensure the directory for the zip exists
    local zip_dir = zip_path:match("(.+)/[^/]+$")
    if zip_dir then
        os.execute("mkdir -p '" .. zip_dir .. "'")
    end

    -- Command: zip -r -q {zip_path} {source_dir}
    -- We assume source_dir is relative to project root
    local cmd = string.format("zip -r -q '%s' '%s'", zip_path, source_dir)
    os.execute(cmd)
end

return {
    ["filetree"] = function(args, kwargs, meta)
        -- This is a custom block: ::: {.filetree} ... :::
    end,

    Div = function(div)
        if div.classes:includes("filetree") then
            local content = ""
            local id = div.identifier
            if id == "" then id = "ide_" .. tostring(os.time()) .. tostring(math.random(1000)) end

            local frame_name = "viewer_" .. id
            local title = div.attributes["title"] or "EXPLORATEUR"
            local zip_link = div.attributes["zip"]

            local zip_html = ""
            if zip_link then
                local zip_name = zip_link:match("^.+/(.+)$") or zip_link
                zip_html = string.format('<a href="%s" class="ui-ide-download" title="Download %s"><i class="bi bi-file-earmark-zip-fill"></i> ZIP</a>'
                    , zip_link, zip_name)

                -- Determine output path in _site
                local site_zip_path = "_site/" .. zip_link

                -- Check if it exists in _site
                local f = io.open(site_zip_path, "r")
                if f ~= nil then
                    io.close(f)
                else
                    local source_dir = zip_link:match("(.+)%.zip$")
                    if source_dir then
                        generate_zip(site_zip_path, source_dir)
                    end
                end
            end

            local list_content = ""

            if quarto.doc.is_format("typst") then
                local link_text = title
                if not title or title == "EXPLORATEUR" then
                    if zip_link then
                        link_text = zip_link:match("^.+/(.+)$") or zip_link
                    else
                        link_text = "Filetree"
                    end
                end

                if zip_link then
                    return pandoc.Para({
                        pandoc.Link(pandoc.Str(link_text), zip_link)
                    })
                else
                    return pandoc.Para({ pandoc.Str(link_text) })
                end
            end

            for _, block in ipairs(div.content) do
                if block.t == "BulletList" then
                    for _, item in ipairs(block.content) do
                        list_content = list_content .. render_item(item, frame_name, id)
                    end
                end
            end

            local html = string.format([[
<div class="ui-ide" id="%s">
  <div class="ui-ide-sidebar">
    <div class="ui-ide-header">
        <span class="ui-ide-title">%s</span>
        %s
    </div>
    <ul class="ui-ide-list">
        %s
    </ul>
  </div>
  <div class="ui-ide-main">
    <iframe name="%s" src="about:blank" onload="this.style.opacity=1"></iframe>
  </div>
  <script>
    (function() {
        var container = document.getElementById('%s');
        if (!container) return;
        var links = container.querySelectorAll('.filetree-link');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var url = this.getAttribute('data-url');
                var frameName = this.getAttribute('data-frame');
                var containerId = this.getAttribute('data-container');
                
                console.log('File clicked:', url);
                
                var container = document.getElementById(containerId);
                if (container) container.classList.add('is-active');
                
                var iframe = document.querySelector('iframe[name="' + frameName + '"]');
                if (iframe) {
                    iframe.src = url;
                    console.log('Iframe src set to', url);
                } else {
                    console.error('Iframe not found:', frameName);
                }
            });
        });
    })();
  </script>
</div>
]]           , id, title, zip_html, list_content, frame_name, id)

            return pandoc.RawBlock("html", html)
        end
    end
}
