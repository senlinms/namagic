/**
 * Actions model
 */
(function(m)
{

    'use strict';

    var fs = require('fs');
    var filesize = require('filesize');
    var String = require('../utils/string.js');

    var module = {};

    /**
     * Removes text
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.removeText = function(subject, options, index, path)
    {
        return {type: 'replace', text: ''};
    };

    /**
     * Inserts free text
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.freeText = function(subject, options, index, path)
    {
        return {type: 'add', text: options.text};
    };

    /**
     * Inserts a sequence of digits
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.digitsSequence = function(subject, options, index, path)
    {
        var start_index = !isNaN(parseInt(options.startIndex)) ? parseInt(options.startIndex) : 0;
        var step = !isNaN(parseInt(options.step)) ? parseInt(options.step) : 1;
        return {type: 'add', text: start_index + (index * step)};
    };

    /**
     * Updates text case
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.updateCase = function(subject, options, index, path)
    {
        if (options.type === 'uppercase')
        {
            subject = subject.toUpperCase();
        }
        if (options.type === 'lowercase')
        {
            subject = subject.toLowerCase();
        }
        if (options.type === 'invert')
        {
            subject = String.inverseCase(subject);
        }
        return {type: 'replace', text: subject};
    };

    /**
     * Inserts creation date
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.creationDate = function(subject, options, index, path)
    {
        var birthtime = _getFileStat.apply(this, [path, 'birthtime']);
        return birthtime instanceof Error ? birthtime : {
            type: 'add',
            text: String.formatDate(birthtime, options.format)
        };
    };

    /**
     * Inserts last modified date
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.lastModifiedDate = function(subject, options, index, path)
    {
        var mtime = _getFileStat.apply(this, [path, 'mtime']);
        return mtime instanceof Error ? mtime : {
            type: 'add',
            text: String.formatDate(mtime, options.format)
        };
    };

    /**
     * Inserts file size
     * @param subject
     * @param index
     * @param options
     * @param path
     */
    module.fileSize = function(subject, options, index, path)
    {
        var size = _getFileStat.apply(this, [path, 'size']);
        return size instanceof Error ? size : {
            type: 'add',
            text: filesize(size, {bits: false, spacer: ''})
        };
    };

    /**
     * Returns the stat of a file if available
     * @param file_path
     * @param stat
     */
    var _getFileStat = function(file_path, stat)
    {
        try
        {
            var stats = fs.statSync(file_path);
            return stats[stat];
        }
        catch (error)
        {
            return new Error('locale:main.errors.stat_not_found');
        }
    };

    m.exports = module;

})(module);