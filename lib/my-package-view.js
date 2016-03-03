var MyPackageView;

module.exports = MyPackageView = (function() {
  function MyPackageView(serializedState) {
    var message;
    this.element = document.createElement('div');
    this.element.classList.add('my-package');
    message = document.createElement('div');
    message.textContent = "The MyPacksage package is Alive! It's ALIVE!";
    message.classList.add('message');
    this.element.appendChild(message);
  }

  MyPackageView.prototype.serialize = function() {};

  MyPackageView.prototype.destroy = function() {
    return this.element.remove();
  };

  MyPackageView.prototype.getElement = function() {
    return this.element;
  };

  return MyPackageView;

})();
