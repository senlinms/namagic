/**
 * Main controller
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var view = new app.views.main();
        var model = new app.models.main();

        /**
         * Inits the controller
         */
        this.init = function()
        {
            view.on('close', $.proxy(_onViewClose, this));
            view.on('loaded', $.proxy(_onViewLoaded, this));
            view.show();
        };

        /**
         * Inits the subview when the view is ready
         */
        var _onViewLoaded = function()
        {
            view.files.on('idle', $.proxy(_onIdle), this);
            view.files.on('add_files', $.proxy(_onAddFilesFromView, this));
            view.files.on('remove_files', $.proxy(_onRemoveFilesFromView, this));
            view.operations.on('edit_operations', $.proxy(_onEditOperationsFromView, this));
        };

        /**
         * Processes files added from the view and send them back
         * @param files
         */
        var _onAddFilesFromView = function(files)
        {
            view.files.lockInterface(true);
            view.operations.lockInterface(true);
            view.files.addFiles(model.addFiles(files));
        };

        /**
         * Processes files deleted from the view and send them back
         * @param ids
         */
        var _onRemoveFilesFromView = function(ids)
        {
            model.removeFiles(ids);
        };

        /**
         * Processes files when modifying an operation from the view
         * @param operations
         */
        var _onEditOperationsFromView = function(operations)
        {
            view.files.updateFiles(model.applyOperations(operations));
        };

        /**
         * Enables UI when a delayed operation has been finished
         * @private
         */
        var _onIdle = function()
        {
            view.files.lockInterface(false);
            view.operations.lockInterface(false);
        };

        /**
         * Closes the view
         */
        var _onViewClose = function()
        {
            view.close();
        };

    };

    app.controllers.main = module;

})(window.App, jQuery);