/**
 * Files subview
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();
        var $ui = {};
        var currentHotkey = false;
        var fileTemplate;
        var $lastSelectedFile = false;
        var $files = {};

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            events.on(event, callback);
        };

        /**
         * Inits the subview
         * @param $window
         * @param $dom
         */
        this.init = function($window, $dom)
        {
            _initUI.apply(this, [$dom]);
            _initEvents.apply(this, [$window]);
        };

        /**
         * Adds files
         * @param files
         */
        this.addFiles = function(files)
        {
            for (var index in files)
            {
                $files[files[index].id] = $(app.utils.template.render(fileTemplate, [files[index]]));
                $ui.list.append($files[files[index].id]);
            }
            $ui.placeholder.toggleClass('js-hidden', $ui.list.children().length > 0);
        };

        /**
         * Updates files
         * @todo optimize text update
         * @param files
         */
        this.updateFiles = function(files)
        {
            for (var index in files)
            {
                $files[index].find('.js-new-name').text(files[index].new_name);
            }
        };

        /**
         * Inits UI
         * @param $dom
         */
        var _initUI = function($dom)
        {
            $ui.panel = $dom;
            $ui.placeholder = $dom.find('.js-placeholder');
            $ui.input = $dom.find('.js-upload');
            $ui.add = $dom.find('.js-files-add');
            $ui.remove = $dom.find('.js-files-remove');
            $ui.list = $dom.find('.js-files-list');
            $ui.dirToggle = $dom.find('.js-toggle-dirs');
            fileTemplate = $dom.find('.js-file-template').html();
        };

        /**
         * Inits events
         * @param $window
         */
        var _initEvents = function($window)
        {
            $window.on('keydown keyup', $.proxy(_onRecordKey, this));
            $ui.placeholder.on('dragenter dragleave mouseenter mouseleave', $.proxy(_onInteractWithPlaceholder, this));
            $ui.placeholder.on('drop', $.proxy(_onAddFilesFromDrop, this));
            $ui.placeholder.on('click', $.proxy(_onAddFilesFromButton, this));
            $ui.add.on('click', $.proxy(_onAddFilesFromButton, this));
            $ui.remove.on('click', $.proxy(_onRemoveActiveFiles, this));
            $ui.input.on('change', $.proxy(_onAddFilesFromUploader, this));
            $ui.list.on('click', '.js-file', $.proxy(_onFileClick, this));
            $ui.dirToggle.on('change', $.proxy(_onToggleDirectories, this));
        };

        /**
         * Records a hotkey
         * @param evt
         */
        var _onRecordKey = function(evt)
        {
            if (evt.which === 16 || evt.which === 91)
            {
                currentHotkey = evt.type === 'keydown' ? evt.which : false;
            }
            if (evt.which === 8 && evt.type === 'keyup')
            {
                _onRemoveActiveFiles.apply(this);
            }
        };

        /**
         * Drags stuff over the panel
         * @param evt
         */
        var _onInteractWithPlaceholder = function(evt)
        {
            $ui.panel.toggleClass('js-drag', evt.type === 'dragenter' || evt.type === 'mouseenter');
        };

        /**
         * Dropping stuff on the files panel
         * @param evt
         */
        var _onAddFilesFromDrop = function(evt)
        {
            _onInteractWithPlaceholder({type: 'dragleave'});
            events.emit('add_files', _cleanSelectedFiles.apply(this, [evt.originalEvent.dataTransfer.files]));
        };

        /**
         * Selecting files from the hidden upload input
         */
        var _onAddFilesFromUploader = function(evt)
        {
            events.emit('add_files', _cleanSelectedFiles.apply(this, [evt.target.files]));
        };

        /**
         * Selecting files from the "Add files..." button
         * @param evt
         */
        var _onAddFilesFromButton = function(evt)
        {
            evt.preventDefault();
            $ui.input.trigger('click');
        };

        /**
         * Toggles directories visibility
         */
        var _onToggleDirectories = function()
        {
            $ui.list.toggleClass('js-directories-visible');
        };

        /**
         * Selects a file in the list
         * @param evt
         */
        var _onFileClick = function(evt)
        {
            var $file = $(evt.currentTarget);
            if (currentHotkey === 16)
            {
                if ($lastSelectedFile === false)
                {
                    $file.toggleClass('js-active');
                }
                else
                {
                    var start_index = Math.min($lastSelectedFile.index(), $file.index());
                    var end_index = Math.max($lastSelectedFile.index(), $file.index());
                    $ui.list.children().slice(start_index, end_index + 1).addClass('js-active');
                }
            }
            else
            {
                $file.toggleClass('js-active');
                if (currentHotkey !== 91)
                {
                    $file.siblings().removeClass('js-active');
                }
            }
            $lastSelectedFile = $file.hasClass('js-active') ? $file : false;
            $ui.remove.attr('disabled', $file.hasClass('js-active') ? false : 'disabled');
        };

        /**
         * Handles files deletion
         */
        var _onRemoveActiveFiles = function()
        {
            var $items = $ui.list.children().filter('.js-active');
            var ids = [];
            $items.each(function()
            {
                var id = $(this).data('id');
                $files[id].remove();
                delete $files[id];
                ids.push(id);
            });
            events.emit('remove_files', ids);
            $lastSelectedFile = false;
            $ui.remove.attr('disabled', 'disabled');
            $ui.placeholder.toggleClass('js-hidden', $ui.list.children().length > 0);
        };

        /**
         * Cleans files selected in the view
         * @param raw_files
         */
        var _cleanSelectedFiles = function(raw_files)
        {
            var files = [];
            for (var index in raw_files)
            {
                if (typeof raw_files[index].path !== 'undefined' && raw_files[index].path !== '')
                {
                    files.push({
                        dir: raw_files[index].path.substring(0, raw_files[index].path.length - raw_files[index].name.length),
                        name: raw_files[index].name
                    });
                }
            }
            return files;
        }

    };

    app.views.main.files = module;

})(window.App, jQuery);