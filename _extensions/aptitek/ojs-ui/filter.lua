-- filter.lua
-- Shortcode definition for ojs-ui

return {
  ['ojs-ui'] = function(args, kwargs)
    local ojs_code = 'import { ui, theme } from "/assets/js/ui.js";'
    return pandoc.RawBlock('markdown', '```{ojs}\n//| echo: false\n' .. ojs_code .. '\n```')
  end
}
