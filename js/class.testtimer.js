var TestTimer = function() {
    this.oDuration = moment.duration(90, 'minutes');
    this.oStart = null;
    this.oEnd = null;
    this.bRunning = false;
    this.sLocale = 'en';
    this.sTimeFormat = 'hh:mm a';
};

TestTimer.prototype.setLocale = function(_sLocale) {
    this.sLocale = _sLocale;
    moment.updateLocale(_sLocale);
};

TestTimer.prototype.setDuration = function(_nMinutes) {
    var nMin = parseInt(_nMinutes);
    if(nMin > 0) {
        this.oDuration = moment.duration(nMin, 'minutes');
        return true;
    } else {
        return false;
    }
};

TestTimer.prototype.adjustDuration = function(_nMinutes) {
    var nMin = parseInt(_nMinutes);
    if(nMin != 0) {
        if(this.setDuration(this.oDuration.asMinutes() + nMin)) {
            this.oEnd = this.oStart.clone();
            this.oEnd.add(this.oDuration);
        }
        return true;
    } else {
        return false;
    }
};

TestTimer.prototype.start = function(_oStartTime) {
    if(!this.bRunning) {
        this.oStart = moment();
        if(typeof(_oStartTime) !== 'undefined' && _oStartTime !== null) {
            var oStartTemp = moment(_oStartTime);
            if(oStartTemp.isValid()) {
                this.oStart = oStartTemp;
            }
        }
        this.oEnd = this.oStart.clone();
        this.oEnd.add(this.oDuration);
        this.bRunning = true;
    }
    return this.bRunning;
};

TestTimer.prototype.stop = function() {
    this.oStart = null;
    this.oEnd = null;
    this.bRunning = false;
};

TestTimer.prototype.isRunning = function() {
    return this.bRunning;
};

TestTimer.prototype.getCurrentTime = function() {
    return moment().format(this.sTimeFormat);
};

TestTimer.prototype.formatSecondsAsCounter = function(_nSeconds) {
    var sReturn = '';
    if(_nSeconds > 3600) {
        var nHours = Math.floor(_nSeconds/3600);
        _nSeconds -= nHours*3600;
        sReturn = nHours + ':';
    }
    var nMinutes = Math.floor(_nSeconds/60);
    _nSeconds -= nMinutes*60;
    sReturn += nMinutes > 9 ? nMinutes : ('0' + nMinutes);
    sReturn += ':' + (_nSeconds > 9 ? _nSeconds : ('0' + _nSeconds));
    return sReturn;
};

TestTimer.prototype.getFinalTime = function() {
    if(this.bRunning) {
        return this.oEnd.format(this.sTimeFormat);
    } else {
        return null;
    }
};

TestTimer.prototype.getRemaining = function() {
    if(this.bRunning) {
        return this.formatSecondsAsCounter(1 + this.oEnd.diff(moment(), 'seconds'));
    } else {
        return 0;
    }
};

TestTimer.prototype.getRemainingPercent = function() {
    if(this.bRunning) {
        var nCurrent = this.oEnd.diff(moment(), 'minutes'),
            nTotal = this.oDuration.asMinutes();
        return nCurrent < 0 ? 0 : (100*nCurrent/nTotal);
    } else {
        return 0;
    }
};

TestTimer.prototype.getPassed = function() {
    if(this.bRunning) {
        return this.formatSecondsAsCounter(moment().diff(this.oStart, 'seconds'));
    } else {
        return 0;
    }
};

TestTimer.prototype.getPassedPercent = function() {
    if(this.bRunning) {
        var nCurrent = moment().diff(this.oStart, 'minutes'),
            nTotal = this.oDuration.asMinutes();
        return nCurrent > nTotal ? 100 : (100*nCurrent/nTotal);
    } else {
        return 0;
    }
};

TestTimer.prototype.isOver = function() {
    return this.bRunning && this.oEnd.diff(moment()) < 0;
};

TestTimer.prototype.isRemainingTimeSmallerThan = function(_nMinutes) {
    return this.bRunning && this.oEnd.diff(moment(), 'minutes') < _nMinutes;
};

TestTimer.prototype.storeAsString = function() {
    return JSON.stringify({
            nDurationMin: this.oDuration.asMinutes(),
            dStart: this.oStart.toJSON(),
            bRunning: this.bRunning,
            sLocale: this.sLocale
        });
};

TestTimer.prototype.loadFromString = function(_sConfig) {
    var oConf = JSON.parse(_sConfig);
    if(typeof(oConf) !== 'undefined' && oConf !== null) {
        if(typeof(oConf.nDurationMin) !== 'undefined') {
            this.setDuration(oConf.nDurationMin);
        }
        if(typeof(oConf.sLocale) !== 'undefined') {
            this.setLocale(oConf.sLocale);
        }
        if(typeof(oConf.bRunning) !== 'undefined' && oConf.bRunning) {
            if(typeof(oConf.dStart) !== 'undefined') {
                this.start(moment(oConf.dStart));
            } else {
                this.start();
            }
        }
    }
};