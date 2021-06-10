var Frontend = {
    nDurationMin: 90,
    sLocale: 'en',
    sTimeFormat: 'hh:mm a',
    
    bShowRemaining: true,
    bShowPassed: false,
    bShowStatusBar: true,
    bEmptyStatusBarInsteadOfFillUp: false,
    sProgressBarColor: '',
    
    bShowCurrent: true,
    bClockTypeAnalog: true,
    
    bShowHeadline: false,
    sHeadline: '',
    
    bShowNotes: false,
    sNotes: '',
    
    cColor: '#000000',
    cBackgroundColor: '#FFFFFF',
    oRecolorOnRemainingMinutes: {
        15: { cColor: '#000000', cBackgroundColor: '#dae299' },
        5: { cColor: '#000000', cBackgroundColor: '#ffdbdb' }
    },
    
    oCurrentTimer: null,
    nIntervalTimerID: null,
    oColorRegExp: new RegExp('#[a-f0-9]{3}|[a-f0-9]{6}', 'i'),
    
    
    init: function() {
        Frontend.showConfiguration();
        
        if(typeof(sessionStorage) !== 'undefined') {
            var sConf = sessionStorage.getItem('frontend');
            if(typeof(sConf) !== 'undefined' && sConf !== null) {
                Frontend.setConfig(JSON.parse(sConf));
            }
            
            sConf = sessionStorage.getItem('testtimer');
            if(typeof(sConf) !== 'undefined' && sConf !== null && sConf !== 'null') {
                Frontend.oCurrentTimer = new TestTimer();
                Frontend.oCurrentTimer.loadFromString(sConf);
                if(!Frontend.oCurrentTimer.isOver()) {
                    Frontend.visualize();
                    Frontend.nIntervalTimerID = window.setInterval(Frontend.update, 1000);
                }
            }
        }
    },
    
    setConfig: function(_oConf) {
        $.each(_oConf, function(_sKey, _mValue) {
                var mValue = null;
                if(typeof(Frontend[_sKey]) !== 'undefined' && typeof(_mValue) !== 'undefined' && _mValue !== null) {
                    switch(_sKey.substr(0, 1)) {
                        case 'b':
                            mValue = (_mValue == 'on' || _mValue == 'selected' || _mValue == 'checked' || _mValue == '1') ? true : false;
                            break;
                        case 'n':
                            mValue = parseInt(_mValue);
                            break;
                        case 's':
                            mValue = $.trim(_mValue);
                            break;
                        case 'c':
                            if(_mValue.match(Frontend.oColorRegExp) !== null) {
                                mValue = _mValue;
                            }
                            break;
                    }
                }
                if(mValue !== null) {
                    Frontend[_sKey] = mValue;
                }
            });
    },
    
    showConfiguration: function() {
        $('.testtimer, .finish, .frontend .config_sub').hide();
        $(document.body).css('color', '#000').css('background-color', '#FFF');
        $('.frontend input, .frontend textarea').each(function(i, _oElem) {
                if(typeof(Frontend[_oElem.id]) !== 'undefined') {
                    $(_oElem).val(Frontend[_oElem.id]);
                }
            });
        $('.frontend, .frontend .config_main, .frontend .config_sep').show();
        $('.frontend form').submit(function(_oEvent) {
                _oEvent.preventDefault();
                Frontend.collectConfig($(this));
                Frontend.start();
                return false;
            });
        $('.frontend a[href^="#config_sub"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                $(this).parents('.config_sep').hide();
                $('.frontend .config_sub').show();
                return false;
            });
        Frontend.visualizeRecolorConfiguration();
        $('.frontend a[href^="#add"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                var nMin = parseInt($('#recolor_nMinutes').val()),
                    oConf = {
                            cColor: $('#recolor_cColor').val(),
                            cBackgroundColor: $('#recolor_cBackgroundColor').val()
                        };
                if(!isNaN(nMin) && nMin >= 0 && oConf.cColor.match(Frontend.oColorRegExp) !== null && oConf.cBackgroundColor.match(Frontend.oColorRegExp)) {
                    Frontend.oRecolorOnRemainingMinutes[nMin] = oConf;
                    $('#recolor_nMinutes').val('');
                    $('#recolor_cColor').val('');
                    $('#recolor_cBackgroundColor').val('');
                    Frontend.visualizeRecolorConfiguration();
                }
                return false;
            });
    },
    
    visualizeRecolorConfiguration: function() {
        //create and add rows
        var aRow = [],
            sTmpl = $('.frontend tfoot tr').html();
        $.each(Frontend.oRecolorOnRemainingMinutes, function(_nMin, _oConf) {
                aRow.push('<tr data-sort="' + _nMin + '" style="color:' + _oConf.cColor + '; background-color:' + _oConf.cBackgroundColor + ';">' + sTmpl.replace('{{_min}}', _nMin) + '</tr>');
            });
        $('.frontend .recolor').html(aRow.join(''));
        
        //sort
        $('.frontend .recolor').find('tr').sort(function(_oA, _oB) {
                return parseInt($(_oA).data('sort')) - parseInt($(_oB).data('sort'));
            }).appendTo($('.frontend .recolor'));
        
        //handle button clicks
        $('.frontend .recolor a[href^="#remove"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                delete Frontend.oRecolorOnRemainingMinutes[$(this).parents('tr').data('sort')];
                Frontend.visualizeRecolorConfiguration();
                return false;
            });
    },
    
    serializeForm: function(_oForm) {
        var oForm = {};
        $(_oForm).find('input, textarea, select').each(function(i, _oElem) {
                if(typeof(_oElem.id) !== 'undefined' && _oElem.id !== null && _oElem.id != '') {
                    oForm[_oElem.id] = _oElem.type == 'checkbox' ? $(_oElem).is(':checked') : $(_oElem).val();
                }
            });
        return oForm;
    },
    
    serializeConfig: function() {
        var oConf = {};
        $.each(Frontend, function(_sKey, _mValue) {
                if(typeof(_mValue) !== 'function') {
                    oConf[_sKey] = _mValue;
                }
            });
        return oConf;
    },
    
    storeConfig: function(_sItem, _sValue) {
        if(typeof(sessionStorage) !== 'undefined') {
            sessionStorage.setItem(_sItem, _sValue);
        }
    },
    
    collectConfig: function(_oForm) {
        var oConf = Frontend.serializeForm(_oForm);
        Frontend.storeConfig('frontend', JSON.stringify(oConf));
        Frontend.setConfig(oConf);
        Frontend.sLocale = $('.testtimer').data('locale');
        Frontend.sTimeFormat = $('.testtimer').data('timeformat');
    },
    
    nl2br: function(_sString) {
        return _sString.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
    },
    
    visualize: function() {
        $('.testtimer .content').hide();
        if(Frontend.bShowHeadline) {
            $('.testtimer .content.testtimer_headline').text(Frontend.sHeadline).show();
        }
        if(Frontend.bShowNotes) {
            $('.testtimer .content.testtimer_notes').html(Frontend.nl2br(Frontend.sNotes)).show();
        }
        if(Frontend.bShowCurrent) {
            $('.testtimer .content.testtimer_current').show();
        }
        if(Frontend.bShowPassed) {
            $('.testtimer .content.testtimer_passed').show();
        }
        if(Frontend.bShowRemaining) {
            $('.testtimer .content.testtimer_remaining').show();
        }
        if(Frontend.bShowStatusBar) {
            $('.testtimer .testtimer_percent_progress')
                .removeClass('progress-bar-info progress-bar-success progress-bar-warning progress-bar-danger')
                .addClass(Frontend.sProgressBarColor);
            if(Frontend.bEmptyStatusBarInsteadOfFillUp) {
                $('.testtimer .content.testtimer_percent_remaining').show();
            } else {
                $('.testtimer .content.testtimer_percent_passed').show();
            }
        }
        
        $(document.body).css('color', Frontend.cColor)
                        .css('background-color', Frontend.cBackgroundColor);
        
        
        $('.testtimer a[href^="#adjust"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                Frontend.oCurrentTimer.adjustDuration($(this).data('minutes'));
                Frontend.storeConfig('testtimer', Frontend.oCurrentTimer.storeAsString());
            });
        $('.testtimer a[href^="#edit"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                var sField = $(this).data('field');
                var sCurrent = Frontend[sField],
                    sCss = sField.substring(1).toLowerCase();
                var sNew = prompt($(this).text(), sCurrent);
                if(sNew !== null) {
                    Frontend[sField] = sNew;
                    Frontend['bShow' + sField.substring(1)] = true;
                    Frontend.storeConfig('frontend', JSON.stringify(Frontend.serializeConfig()));
                    $('.testtimer .content.testtimer_' + sCss).html(Frontend.nl2br(sNew)).show();
                }
            });
        $('.testtimer a[href^="#restart"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                Frontend.oCurrentTimer.stop();
                Frontend.oCurrentTimer.start();
                Frontend.storeConfig('testtimer', Frontend.oCurrentTimer.storeAsString());
            });
        $('.testtimer a[href^="#abort"]').off('click').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                Frontend.stop();
            });
        
        $('.frontend, .finish').hide();
        $('.testtimer').show();
    },
    
    update: function() {
        if(Frontend.oCurrentTimer.isOver()) {
            Frontend.stopTimerOnly();
            $('.frontend, .testtimer').hide();
            $('.finish').show();
            $('.finish a[href^="#back"]').off('click').on('click', function(_oEvent) {
                    _oEvent.preventDefault();
                    Frontend.showConfiguration();
                });
        } else {
            //timely data
            $('.testtimer_final').text(Frontend.oCurrentTimer.getFinalTime());
            $('.testtimer_remaining').text(Frontend.oCurrentTimer.getRemaining());
            $('.testtimer_passed').text(Frontend.oCurrentTimer.getPassed());
            var nPercent = Frontend.bEmptyStatusBarInsteadOfFillUp? Frontend.oCurrentTimer.getPassedPercent() : Frontend.oCurrentTimer.getRemainingPercent();
            $('.testtimer_percent_value').text(nPercent);
            $('.testtimer_percent_progress').css('width', nPercent+'%').attr('aria-valuenow', nPercent);    

            //find current colors
            var cColorConf = { cColor: Frontend.cColor, cBackgroundColor: Frontend.cBackgroundColor };
            $.each(Frontend.oRecolorOnRemainingMinutes, function(_nMin, _oConf) {
                    if(Frontend.oCurrentTimer.isRemainingTimeSmallerThan(_nMin)) {
                        cColorConf = _oConf;
                        $(document.body).css('color', _oConf.cColor)
                                        .css('background-color', _oConf.cBackgroundColor);
                        return false;
                    }
                });

            //draw the current analog clock if wanted
            if(Frontend.bShowCurrent && Frontend.bClockTypeAnalog) {
                var nOuterWidth = parseInt($('.testtimer .content.testtimer_current').width()) * 0.8,
                    nMaxHeight = parseInt($(window).height()) * 0.8;
                if(nOuterWidth > nMaxHeight) {
                    $('#testtimer_analog').width(nMaxHeight);
                } else {
                    $('#testtimer_analog').height(nOuterWidth);
                }
                Frontend.updateAnalog();
            } else {
                $('.testtimer .content.testtimer_current').text(Frontend.oCurrentTimer.getCurrentTime());
            }
        }
    },
    
    updateAnalog: function() {
        var dNow = moment();
        var nHour = dNow.hours(),
            nMin = dNow.minutes(),
            nSec = dNow.seconds();
        $('.testtimer .content.testtimer_current object.clock_analog').each(function(i, _oClock) {
                _oClock = _oClock.contentDocument;
                $('#hourHand', _oClock).attr('transform', 'rotate(' + (30*nHour + .5*nMin) + ', 100, 100)');
                $('#minuteHand', _oClock).attr('transform', 'rotate(' + (6*nMin + .1*nSec) + ', 100, 100)');
                $('#secondHand', _oClock).attr('transform', 'rotate(' + (6*nSec) + ', 100, 100)');
            });
    },
    
    start: function() {
        Frontend.oCurrentTimer = new TestTimer();
        Frontend.oCurrentTimer.setLocale(Frontend.sLocale);
        Frontend.oCurrentTimer.sTimeFormat = Frontend.sTimeFormat;
        Frontend.oCurrentTimer.setDuration(Frontend.nDurationMin);
        Frontend.oCurrentTimer.start();
        Frontend.storeConfig('testtimer', Frontend.oCurrentTimer.storeAsString());
        Frontend.visualize();
        Frontend.nIntervalTimerID = window.setInterval(Frontend.update, 1000);
    },
    
    stopTimerOnly: function() {
        window.clearInterval(Frontend.nIntervalTimerID);
        Frontend.oCurrentTimer.stop();
        Frontend.storeConfig('testtimer', null);
    },
    
    stop: function() {
        Frontend.stopTimerOnly();
        Frontend.showConfiguration();
    }
};