'use strict';
/*! docs.js - v0.1.1
 * http://admindesigns.com/
 * Copyright (c) 2015 Admin Designs;*/

/* Core Documentation functions required for
 * most of the themes vital functionality */
var Docs = function (options) {

    // Variables
    var Body = $('body');


    // Form related Functions
    var runCore = function (options) {

        var Body = $('body');


        // /*!
        // *** prettyPre ***/

        // (function( $ ) {

        //     $.fn.prettyPre = function( method ) {

        //         var defaults = {
        //             ignoreExpression: /\s/ // what should be ignored?
        //         };

        //         var methods = {
        //             init: function( options ) {
        //                 this.each( function() {
        //                     var context = $.extend( {}, defaults, options );
        //                     var $obj = $( this );
        //                     var usingInnerText = true;
        //                     var text = $obj.get( 0 ).innerText;

        //                     // some browsers support innerText...some don't...some ONLY work with innerText.
        //                     if ( typeof text == "undefined" ) {
        //                         text = $obj.html();
        //                         usingInnerText = false;
        //                     }

        //                     // use the first line as a baseline for how many unwanted leading whitespace characters are present
        //                     var superfluousSpaceCount = 0;
        //                     var currentChar = text.substring( 0, 1 );

        //                     while ( context.ignoreExpression.test( currentChar ) ) {
        //                         currentChar = text.substring( ++superfluousSpaceCount, superfluousSpaceCount + 1 );
        //                     }

        //                     // split
        //                     var parts = text.split( " \n" );
        //                     var reformattedText = "";

        //                     // reconstruct
        //                     var length = parts.length;
        //                     for ( var i = 0; i < length; i++ ) {
        //                         // cleanup, and don't append a trailing newline if we are on the last line
        //                         reformattedText += parts[i].substring( superfluousSpaceCount ) + ( i == length - 1 ? "" : " \n" );
        //                     }

        //                     // modify original
        //                     if ( usingInnerText ) {
        //                         $obj.get( 0 ).innerText = reformattedText;
        //                     }
        //                     else {
        //                         // This does not appear to execute code in any browser but the onus is on the developer to not
        //                         // put raw input from a user anywhere on a page, even if it doesn't execute!
        //                         $obj.html( reformattedText );
        //                     }
        //                 } );
        //             }
        //         }

        //         if ( methods[method] ) {
        //             return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        //         }
        //         else if ( typeof method === "object" || !method ) {
        //             return methods.init.apply( this, arguments );
        //         }
        //         else {
        //             $.error( "Method " + method + " does not exist on jQuery.prettyPre." );
        //         }
        //     }
        // } )( jQuery );
        //   $('code').prettyPre();


        // Hover function for expanding large highlight trays
        // that are marked with the "highlight-hover" class
        function highlightCheck() {

            if ($('html.template-page').length) {
                return;
            }

            $('div.highlight').each(function (i, e) {

                var This = $(this);
                if (This.hasClass('force-height')) {
                    return;
                }

                var Selector = This.children('pre');
                if (Selector.height() > 185) {
                    This.addClass('highlight-hover');

                    // var Selector = This.children('pre');
                    var autoHeight = Selector.css('height', 'auto').height();
                    Selector.css('height', '175');

                    This.hoverIntent({
                        over: function () {
                            Selector.css('height', autoHeight + 45);
                        },
                        out: function () {
                            Selector.css('height', '');
                        },
                        timeout: 300
                    });

                }

            });
        }

        highlightCheck();

        // Trigger highlight check on tab change.
        $(document).delegate('li.list-group-item a[data-toggle]', 'click', function () {
            setTimeout(function () {
                highlightCheck();
            }, 200);
        });


        // list-group-accordion functionality
        var listAccordion = $('.list-group-accordion');
        var accordionItems = listAccordion.find('.list-group-item');
        var accordionLink = listAccordion.find('.sign-toggle');
        $(document).delegate('.list-group-accordion .list-group-item .sign-toggle', 'click', function () {
            var This = $(this);
            var Parent = This.parent('.list-group-item');

            if (Parent.hasClass('active')) {
                Parent.toggleClass('active');
            } else {
                accordionItems.removeClass('active');
                Parent.addClass('active');
            }
        });
    }

    return {
        init: function (options) {

            // Set Default Options
            var defaults = {
                option1: 'value', // desc
            };

            // Extend Default Options.
            var options = $.extend({}, defaults, options);

            // Call Core Functions
            runCore(options);


        }

    }
}
();


// Global Library of Theme colors for Javascript plug and play use
var bgPrimary = '#4a89dc',
    bgPrimaryL = '#5d9cec',
    bgPrimaryLr = '#83aee7',
    bgPrimaryD = '#2e76d6',
    bgPrimaryDr = '#2567bd',
    bgSuccess = '#70ca63',
    bgSuccessL = '#87d37c',
    bgSuccessLr = '#9edc95',
    bgSuccessD = '#58c249',
    bgSuccessDr = '#49ae3b',
    bgInfo = '#3bafda',
    bgInfoL = '#4fc1e9',
    bgInfoLr = '#74c6e5',
    bgInfoD = '#27a0cc',
    bgInfoDr = '#2189b0',
    bgWarning = '#f6bb42',
    bgWarningL = '#ffce54',
    bgWarningLr = '#f9d283',
    bgWarningD = '#f4af22',
    bgWarningDr = '#d9950a',
    bgDanger = '#e9573f',
    bgDangerL = '#fc6e51',
    bgDangerLr = '#f08c7c',
    bgDangerD = '#e63c21',
    bgDangerDr = '#cd3117',
    bgAlert = '#967adc',
    bgAlertL = '#ac92ec',
    bgAlertLr = '#c0b0ea',
    bgAlertD = '#815fd5',
    bgAlertDr = '#6c44ce',
    bgSystem = '#37bc9b',
    bgSystemL = '#48cfad',
    bgSystemLr = '#65d2b7',
    bgSystemD = '#2fa285',
    bgSystemDr = '#288770',
    bgLight = '#f3f6f7',
    bgLightL = '#fdfefe',
    bgLightLr = '#ffffff',
    bgLightD = '#e9eef0',
    bgLightDr = '#dfe6e9',
    bgDark = '#3b3f4f',
    bgDarkL = '#424759',
    bgDarkLr = '#51566c',
    bgDarkD = '#2c2f3c',
    bgDarkDr = '#1e2028',
    bgBlack = '#283946',
    bgBlackL = '#2e4251',
    bgBlackLr = '#354a5b',
    bgBlackD = '#1c2730',
    bgBlackDr = '#0f161b';

