/**
 * Operations subview
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();
        var $ui = {};
        var operationTemplate;
        var sortableInputTemplate;

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
         * @param $dom
         */
        this.init = function($dom)
        {
            _initUI.apply(this, [$dom]);
            _initEvents.apply(this);
        };

        /**
         * Inits UI
         * @param $dom
         */
        var _initUI = function($dom)
        {
            $ui.panel = $dom;
            $ui.placeholder = $dom.find('.js-placeholder');
            $ui.add = $dom.find('.js-operation-add');
            $ui.apply = $dom.find('.js-operation-apply');
            $ui.operations = $dom.find('.js-operations');
            operationTemplate = $dom.find('.js-operation-template').html();
            sortableInputTemplate = $dom.find('.js-sortable-input-template').html();
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.add.on('click', $.proxy(_onAddOperation, this));
            $ui.apply.on('click', $.proxy(_onApplyOperations, this));
            $ui.operations.sortable({
                items: '.js-operation',
                axis: 'y',
                placeholder: 'js-operation-placeholder',
                zIndex: 40
            });
            $ui.operations.on('change', '.js-select-type', $.proxy(_onSelectType, this));
            $ui.operations.on('click', '.js-delete-operation', $.proxy(_onDeleteOperation, this));
            $ui.operations.on('click', '.js-delete-item', $.proxy(_onDeleteInputItem, this));
            $ui.operations.on('change', '.js-add-item', $.proxy(_onAddInputItem, this));
            $ui.operations.on('change keyup', 'input,select', $.proxy(_onEditOperations, this));
            $ui.operations.on('change', '.js-apply-to', $.proxy(_onEditOperations, this));
        };

        /**
         * Editing operations
         */
        var _onEditOperations = function()
        {
            var operations = [];
            var $operations = $ui.operations.children();
            $operations.each(function()
            {
                var $operation = $(this);
                var $search = $operation.find('.js-search .js-fields:visible');
                var $action = $operation.find('.js-action .js-fields:visible');
                var $apply_to = $operation.find('.js-apply-to');
                var operation = {
                    search: _parseOperationFieldsPanel.apply(this, [$search]),
                    action: _parseOperationFieldsPanel.apply(this, [$action]),
                    applyTo: $apply_to.find('option:selected').val()
                };
                operations.push(operation);
            });
            events.emit('edit_operations', operations);
        };

        /**
         * Reads a panel of fields and returns its options
         * @param $fields_panel
         */
        var _parseOperationFieldsPanel = function($fields_panel)
        {
            if ($fields_panel.length === 0)
            {
                return false;
            }
            var fields_panel = {type: $fields_panel.data('type'), options: {}};
            var $inputs = $fields_panel.find('input[type="text"],input[type="radio"]:checked,input[type="hidden"]');
            $inputs.each(function()
            {
                var $option = $(this);
                fields_panel.options[$option.attr('name')] = $option.val();
            });
            var $checkboxes = $fields_panel.find('input[type="checkbox"]');
            $checkboxes.each(function()
            {
                var $option = $(this);
                fields_panel.options[$option.attr('name')] = $option.is(':checked');
            });
            return fields_panel;
        };

        /**
         * Select a search or replace type in an operation box
         * @param evt
         * @private
         */
        var _onSelectType = function(evt)
        {
            var $type = $(evt.currentTarget);
            var $options = $type.closest('.js-options');
            $options.find('.js-fields').hide();
            $options.find('.js-fields[data-type="' + $type.val() + '"]').show();
        };

        /**
         * Adds an operation
         * @param evt
         */
        var _onAddOperation = function(evt)
        {
            evt.preventDefault();
            var $new_operation = $(operationTemplate);
            $ui.operations.append($new_operation);
            $ui.operations.sortable('refresh');
            $new_operation.find('.js-fields').hide();
            $new_operation.find('.js-sortable-input').sortable({
                items: '.js-sortable-item',
                placeholder: 'js-item-placeholder',
                stop: $.proxy(_onSortInputItem, this)
            });
            $ui.placeholder.hide();
        };

        /**
         * Deletes an item from a sortable input
         * @param evt
         */
        var _onDeleteInputItem = function(evt)
        {
            var $item = $(evt.currentTarget);
            var $field = $item.closest('.js-sortable-input');
            $item.closest('.js-sortable-item').remove();
            _updateInputWithItems.apply(this, [$field]);
        };

        /**
         * Adds an item in a sortable input
         * @param evt
         * @private
         */
        var _onAddInputItem = function(evt)
        {
            var $select = $(evt.currentTarget);
            var $option = $select.find('option:selected');
            var $field = $select.closest('.js-sortable-input');
            var template = app.utils.template.render(sortableInputTemplate, [{
                label: $option.data('label'),
                value: $option.data('value')
            }]);
            $field.append(template).sortable('refresh');
            $select.val('');
            _updateInputWithItems.apply(this, [$field]);
        };

        /**
         * Sorts items in a sortable input
         * @param evt
         * @param ui
         */
        var _onSortInputItem = function(evt, ui)
        {
            _updateInputWithItems.apply(this, [ui.item.closest('.js-sortable-input')]);
        };

        /**
         * Updates the value of a sortable field, depending on the current configuration
         * @param $sortable_field
         */
        var _updateInputWithItems = function($sortable_field)
        {
            var value = [];
            $sortable_field.find('.js-sortable-item').each(function()
            {
                value.push($(this).data('value'));
            });
            $sortable_field.find('.js-value').val(value.join(''));
        };

        /**
         * Deletes an operation
         * @param evt
         */
        var _onDeleteOperation = function(evt)
        {
            evt.preventDefault();
            $(evt.currentTarget).closest('.js-operation').remove();
            $ui.operations.sortable('refresh');
            $ui.placeholder.toggle($ui.operations.children().length === 0);
            _onEditOperations();
        };

        /**
         * Applies operations
         * @param evt
         */
        var _onApplyOperations = function(evt)
        {
            evt.preventDefault();
            console.log('apply @todo')
        };

    };

    app.views.operations = module;

})(window.App, jQuery);