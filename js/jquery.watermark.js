/*  @preserve
 *  Project: jQuery plugin Watermark
 *  Description: Add watermark on images use HTML5 and Javascript.
 *  Author: Zzbaivong (devs.forumvi.com)
 *  Version: 1.0.2
 *  License: MIT
 */

/*
 *  jquery-boilerplate - v3.4.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
(function($, window, document, undefined) {
    'use strict';

    var pluginName = 'watermark',
        defaults = {
            path: 'watermark.png',
            dataPath: false,

            text: '',
            textWidth: 130,
            textSize: 13,
            textColor: 'white',
            textBg: 'rgba(0, 0, 0, 0.4)',

            gravity: 'se', // nw | n | ne | w | e | sw | s | se | c
            opacity: 0.7,
            margin: 0,
            fullOverlay: false,

            outputWidth: 'auto',
            outputHeight: 'auto',
            outputType: 'jpeg', // jpeg | png | webp

            done: function(imgURL) {
                this.src = imgURL;
            },
            fail: function(/*imgURL*/) {
                // console.error(imgURL, 'image error!');
            },
            always: function(/*imgURL*/) {
                // console.log(imgURL, 'image URL!');
            },
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function() {
            var _this = this,
                ele = _this.element,
                set = _this.settings,
                actualPath = set.dataPath ? $(ele).data(set.dataPath) : set.path,
                wmData = {
                    imgurl: actualPath,
                    type: 'png',
                    cross: true,
                },
                imageData = {
                    imgurl: ele.src,
                    cross: true,
                    type: set.outputType,
                    width: set.outputWidth,
                    height: set.outputHeight,
                };

            // Watermark dạng base64
            if (actualPath.search(/data:image\/(png|jpg|jpeg|gif);base64,/) === 0) {
                wmData.cross = false;
            }

            // Browsing image base64
            if (ele.src.search(/data:image\/(png|jpg|jpeg|gif);base64,/) === 0) {
                imageData.cross = false;
            }

            var defer = $.Deferred();

            $.when(defer).done(function(imgObj) {
                imageData.wmObj = imgObj;
                _this.imgurltodata(imageData, function(dataURL) {
                    set.done.call(ele, dataURL);
                    set.always.call(ele, dataURL);
                });
            });

            if (set.text !== '') {
                wmData.imgurl = _this.textwatermark();
                wmData.cross = false;
            }

            _this.imgurltodata(wmData, function(imgObj) {
                defer.resolve(imgObj);
            });
        },

        /**
         * Convert text to image for watermark
         * @returns {String} Base64 image URL
         */
        textwatermark: function() {
            var _this = this,
                set = _this.settings,
                canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),
                w = set.textWidth,
                h = set.textSize + 8;

            canvas.width = w;
            canvas.height = h;

            ctx.fillStyle = set.textBg;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = set.textColor;
            ctx.textAlign = 'center';
            ctx.font = '500 ' + set.textSize + 'px Sans-serif';

            ctx.fillText(set.text, w / 2, set.textSize + 2);

            return canvas.toDataURL();
        },

        /**
         * Convert images to base64
         * @param   {Object}  data     The parameters set to distinguish the type of image and with the watermark
         * @param   {String}  callback base64 image URL callback
         */
        imgurltodata: function(data, callback) {
            var _this = this,
                set = _this.settings,
                ele = _this.element;

            var img = new Image();

            if (data.cross) {
                img.crossOrigin = 'Anonymous';
            }

            img.onload = function() {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');

                var w = this.width, // image height
                    h = this.height, // image width
                    ctxH;

                if (data.wmObj) {
                    if (data.width !== 'auto' && data.height === 'auto' && data.width < w) {
                        h = (h / w) * data.width;
                        w = data.width;
                    } else if (data.width === 'auto' && data.height !== 'auto' && data.height < h) {
                        w = (w / h) * data.height;
                        h = data.height;
                    } else if (data.width !== 'auto' && data.height !== 'auto' && data.width < w && data.height < h) {
                        w = data.width;
                        h = data.height;
                    }
                }

                //Rotate vertical watermark using text, when in the middle of the vertical edge
                if ((set.gravity === 'w' || set.gravity === 'e') && !data.wmObj) {
                    canvas.width = h;
                    canvas.height = w;
                    ctxH = -h;
                    ctx.rotate((90 * Math.PI) / 180);
                } else {
                    canvas.width = w;
                    canvas.height = h;
                    ctxH = 0;
                }

                //Fill a white background for the output image in jpeg
                if (data.type === 'jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                }

                ctx.drawImage(this, 0, ctxH, w, h);

                // Handle the inserted watermark
                if (data.wmObj) {
                    // Transparency
                    var op = set.opacity;
                    if (op > 0 && op < 1) {
                        ctx.globalAlpha = set.opacity;
                    }

                    // Insert position, call in direction on the map
                    var wmW = set.fullOverlay ? w : data.wmObj.width,
                        wmH = set.fullOverlay ? h : data.wmObj.height,
                        pos = set.margin,
                        gLeft,
                        gTop;

                    switch (
                        set.gravity // nw | n | ne | w | e | sw | s | se | c
                    ) {
                        case 'nw': // Northwest
                            gLeft = pos;
                            gTop = pos;
                            break;
                        case 'n': // North
                            gLeft = w / 2 - wmW / 2;
                            gTop = pos;
                            break;
                        case 'ne': // Northweast
                            gLeft = w - wmW - pos;
                            gTop = pos;
                            break;
                        case 'w': // West
                            gLeft = pos;
                            gTop = h / 2 - wmH / 2;
                            break;
                        case 'e': // East
                            gLeft = w - wmW - pos;
                            gTop = h / 2 - wmH / 2;
                            break;
                        case 'sw': // Southwest
                            gLeft = pos;
                            gTop = h - wmH - pos;
                            break;
                        case 's': // South
                            gLeft = w / 2 - wmW / 2;
                            gTop = h - wmH - pos;
                            break;
                        case 'c': // Center
                            gLeft = w / 2 - wmW / 2;
                            gTop = (h - wmH) / 2;
                            break;
                        default:
                            // Southeast
                            gLeft = w - wmW - pos;
                            gTop = h - wmH - pos;
                    }
                    ctx.drawImage(data.wmObj, gLeft, gTop, wmW, wmH);
                }

                // Output image url as base64
                var dataURL = canvas.toDataURL('image/' + data.type);

                if (typeof callback === 'function') {
                    if (data.wmObj) {
                        // Already have watermark
                        callback(dataURL);
                    } else {
                        // watermark
                        var wmNew = new Image();
                        wmNew.src = dataURL;
                        callback(wmNew);
                    }
                }

                canvas = null;
                
            };

            // Handling image loading error or possibly due to rejection of CORS headers
            img.onerror = function() {
                set.fail.call(this, this.src);
                set.always.call(ele, this.src);
                return false;
            };
           
            img.src = data.imgurl;
        },
    });

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);
