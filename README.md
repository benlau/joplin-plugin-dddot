Joplin DDDot
===========

DDDot is a Joplin plugin to provide a set of tools like recent notes, shortcuts, scratchpad, and .... in a single sidebar.

**Main Features**:

1. Recent Notes - Show recently opened notes
2. Shortcuts - A bookmark of faviour notes
3. Scratchpad - Write something quickly without bothering to find the right note to insert
4. Backlinks - Show the backlinks of the selected note
5. Outline - Show the table of content of the selected note
6. Daily Note - Create / Open a note for today.
7. Random Note - Open a random note

![Screenshot](https://user-images.githubusercontent.com/82716/193397815-c3cbfa48-0507-4341-8125-2bdb63877b3c.png)

**Minor Features**

- Support to enable/disable an individual tool
- Support changing the tool order by drag and drop
- Support dark theme

# User Guide

## General Usage

### Toggle the visibility of DDDot

Press the DDDot icon in the toolbar

![Screenshot](https://raw.githubusercontent.com/benlau/joplin-plugin-dddot/master/docs/toggle-visibility.png)

### Enable/disable a tool

Launch Preference and open DDDot section. It will show the options to enable/disable a tool 

### Draggable link

The links in Recent Notes and Backlinks are draggable. You may drag it to the note editor to insert the link there.

## Shortcuts

- Add a shortcut to a note - Drag a note from the note list over the Shortcuts area. 
- Add a shortcut to a notebook - Drag a folder from the Notebooks list over the Shortcuts area.
- Remove shortcut - Right-click on a shortcut. It will prompt a dialog for confirmation
- Import/Export shortcut list

Add a shortcut to search

Install the [Embed search](https://discourse.joplinapp.org/t/embed-any-search-with-content/14328) plugin
Create a note with embed search
Drag the note from the note list over the Shortcuts tool

## Outline

![image](https://github.com/benlau/joplin-plugin-dddot/assets/82716/a90087a5-1e95-4b75-a690-38ef472302f5)

**Features**:

- Show the table of content of the selected note
- Click on the item will go to the section
- Press the "Copy" button to copy the link of the section
- Manual/Auto Resize Mode
- Link filter

**Manual vs Auto Resize Mode**

The Outline tool has a fixed height by default. Users could adjust it by dragging the border or clicking the "Resize Height to Fit Content" button.

Users may change it to be auto resized via the Joplin Plugin settings. 

**Link filter**

![image](https://github.com/benlau/joplin-plugin-dddot/assets/82716/bdf1a47f-cb9a-4257-8b7c-d99ce8b0629a)

The Outline tool support to display more than just headings; it can also show links within the note. To configure this, go to Settings > DDDot > Include URL with schemas (comma-separated, e.g., http, https, file). Here, you can specify the types of links you want to appear in the Outline.




## Daily Note

This tool puts a button at the top of the DDDot panel that will create a note for today. If it exists then it will just open it. The title will be set to today in your preferred format.

By default, it is not using 0:00 as the start time of a day. It is set to 07:00. You may change the option via the preference interface. Moreover, You may assign a shortcut key to the `dddot.cmd.openDailyNote` command to trigger the function. (Default: Cmd+O / Ctrl+O)

It will create the note according to the default notebook setting. If it is not specified, it will create the note in the first notebook. You may change the default notebook in the preference interface by setting the name of the notebook/folder (e.g. `Inbox`, `Welcome ! (Desktop`). In case you have notebooks/folders with the same name, it will create the note in the first notebook/folder.

## Random Note

This tool puts a button at the top of the DDDot panel that will open a random note. It also registered a command of `dddot.cmd.openRandomNote`, you may assign a shortcut key to trigger this feature. (Default: Cmd+R / Ctrl+R)

## Note Quick View

Right click on the items inside Recent Notes and Backlinks will open a Note Quick View for browsing the content. The viewer is read-only but you could manipulate the opened note with the following operations:

![image](https://user-images.githubusercontent.com/82716/193398035-f0186a69-d284-4a34-b4f0-d247b214ddfd.png)

**Cut and append selected text**

It will cut the selected text from your note editor and append it to the opened note in the Quick View. If no text selected, it will do nothing.

**Append note link**

It will copy the link of the note in the editor in markdown format, and then append to the opened note in quick view.

**Swap**

Swap the opened note in the note editor and the quick view.

