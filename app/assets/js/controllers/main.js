/**
 * Main controller
 */
(function(m)
{

    'use strict';

    var WebView = require('WebView');
    var Window = require('Window');
    var FileDialog = require('FileDialog');
    var Menubar = require('../utils/menubar.js');
    var Model = require('../models/main.js');
    var fs = require('fs');

    var module = {};

    var model = null;
    var window = null;
    var webview = null;
    var menubar = null;
    var manifest = JSON.parse(fs.readFileSync(__dirname + '/../../../package.json', {encoding: 'utf8'}));

    /**
     * Inits
     */
    module.init = function()
    {
        model = new Model();
        model.on('progress', function(percentage)
        {
            webview.postMessage(JSON.stringify({type: 'set_progress', data: percentage}));
        });
        model.on('idle', function()
        {
            webview.postMessage(JSON.stringify({type: 'lock_ui', data: false}));
        });
        model.on('add_files', function(files)
        {
            webview.postMessage(JSON.stringify({type: 'add_files', data: files}));
            webview.postMessage(JSON.stringify({type: 'lock_ui', data: true}));
        });
        model.on('remove_files', function(ids)
        {
            webview.postMessage(JSON.stringify({type: 'remove_files', data: ids}));
        });
        model.on('update_files', function(files)
        {
            webview.postMessage(JSON.stringify({type: 'update_files', data: files}));
        });
        model.on('set_destination', function(destination_dir)
        {
            webview.postMessage(JSON.stringify({type: 'lock_ui', data: true}));
            model.applyOperationsOnFiles(true, destination_dir, false);
        });

        window = new Window();
        window.visible = false;
        window.width = 900;
        window.height = 600;
        window.resizable = true;
        window.title = '';

        menubar = new Menubar(manifest.name, manifest.version);
        menubar.setOnWindow(window);


        var Button = require('DateWell');
        var button = new Button();
        button.left = button.top = button.right = button.bottom = 0;
        button.acceptsDroppedTypes = ['file'];//['text', 'image', 'rtf', 'html', 'video', 'audio', 'file'];
        window.appendChild(button);


        button.addEventListener('dragenter', function()
        {
            console.log('dragenter');
        });
        button.addEventListener('dragexit', function()
        {
            console.log('dragexit');

        });
        button.addEventListener('drop', function()
        {
            console.log('drop');

        });
        button.addEventListener('dropped', function(files)
        {
            files.map(function(file)
            {
                console.log(file.data.toString());
            });
            return true;
        });
        button.addEventListener('dropping', function()
        {
            console.log('dropping');
        });


        WebView.useNewWKWebView = false;
        webview = new WebView();
        //window.appendChild(webview);
        webview.left = webview.top = webview.right = webview.bottom = 0;
        webview.location = "app://assets/html/main.html";
        webview.acceptsDroppedTypes = ['text', 'image', 'rtf', 'html', 'video', 'audio', 'file'];
        webview.on('load', function()
        {
            window.visible = true;
        });
        webview.on('console', function(evt, message)
        {
            if (evt === 'log')
            {
                console.log(message);
            }
        });
        webview.on('message', function(evt)
        {
            evt = JSON.parse(evt);
            if (evt.type === 'add_files')
            {
                var dialog = new FileDialog('open');
                dialog.allowMultiple = true;
                dialog.allowDirectories = true;
                dialog.open(window);
                dialog.addEventListener('select', function()
                {
                    var files = [];
                    for (var index = 0; index < dialog.selection.length; index += 1)
                    {
                        files.push(dialog.selection[index].replace(/\/$/, ''));
                    }
                    model.addFiles(files);
                });
            }
            if (evt.type === 'remove_files')
            {
                model.removeFiles(evt.data);
            }
            if (evt.type === 'edit_operations')
            {
                model.storeAndProcessOperations(evt.data);
            }
            if (evt.type === 'apply_operations' && model.hasFiles())
            {
                model.getDestinationDir(window);
            }
            if (evt.type === 'overwrite' && evt.data.type === 'dismiss')
            {
                model.dismissOverwriteFiles(evt.data.ids);
            }
            if (evt.type === 'overwrite' && evt.data.type === 'overwrite')
            {
                webview.postMessage(JSON.stringify({type: 'lock_ui', data: true}));
                model.applyOperationsOnFiles(evt.data.ids, false, true);
            }
            if (evt.type === 'cancel')
            {
                model.cancelCurrentWork();
            }
        });
    };

    m.exports = module;

})(module);