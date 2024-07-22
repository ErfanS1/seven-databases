map = function () {
    var digits = distinctDigits(this);
    emit({
        digits: digits,
        country: this.components.country
    }, {
        count: 1
    });
}