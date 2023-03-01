# Obsidian Marp Plugin

Plugin for using [Marp](https://marp.app/) on [Obsidian.md](https://obsidian.md/).

## Open the Preview

Select the tab for the Markdown file, then click the button on the ribbon or run `Marp: Open Preview` from the command palette to see a preview.

![open_preview](docs/open_preview.gif)

### Auto Reload

![auto_reload](docs/auto_reload.gif)

## Export Slides

**You need to install Node.js to export slides, because this plugin uses the `npx` command to export slides.**
You can choose your preferred format from PDF, PPTX, and HTML.  
**Output is always to the `Downloads` directory.**

![export](docs/export.gif)

## Settings

### Enable Auto Reload

type: toggle  
default: on

If on, the preview is automatically updated when the Markdown file is saved.

### Enable Open Preview in Split Tab

type: toggle  
default: on

Enables the ability to open previews in split tabs. When turned off, a new tab is created in the same split as the markdown file.

### Theme Folder Location

type: text

Specify the relative path of the directory where the theme is saved. By saving the css files in the specified directory, Marp can use a custom theme.

**\*Obsidian must be restarted after adding css.**

#### Example: If you set `MarpTheme` as `Theme Folder Location`

```text
<your-vault>
└── MarpTheme  ← Make this directory
    ├── beamer.css  ← Then save custom css here!
    ├── border.css
    └── gradient.css
```
