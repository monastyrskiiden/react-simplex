'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Storage = exports.SimplexMapToProps = exports.SimplexStorage = exports.SimplexConnect = exports.Simplex = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
/*jslint node: true*/
/*jshint esnext : true */
/*jslint indent: 2 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ref = function () {

  var GLOBAL_EVENT_NAME = 'any';

  var Key = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });

  var isNode = function isNode() {
    try {
      return window ? false : true;
    } catch (e) {
      return true;
    }
  };

  var React = isNode() ? global.React : window.React;

  if (typeof React == 'undefined') {
    React = require('react');
  }

  var Storage = null;
  if (isNode()) {
    try {
      Storage = require('react-native').AsyncStorage;
    } catch (e) {
      var StoragePolyFill = function () {
        function StoragePolyFill() {
          _classCallCheck(this, StoragePolyFill);

          this.store = {};
        }

        _createClass(StoragePolyFill, [{
          key: 'getItem',
          value: function getItem(name, callback) {
            if (callback) {
              callback(this.store[name]);
            } else {
              return this.store[name];
            }
          }
        }, {
          key: 'setItem',
          value: function setItem(name, value, callback) {
            this.store[name] = value;
          }
        }]);

        return StoragePolyFill;
      }();

      Storage = new StoragePolyFill();
    }
  } else {
    Storage = localStorage;
  }

  var SimplexStorage = function () {
    function SimplexStorage() {
      _classCallCheck(this, SimplexStorage);

      this.listeners = [];
      this.Storage = {};
      this.sync = {};
    }

    _createClass(SimplexStorage, [{
      key: 'init',
      value: function init(name) {
        var _this = this,
            _arguments = arguments;

        var default_value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var sync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        this.Storage[name] = default_value;
        this.sync[name] = sync;

        if (!this.hasOwnProperty(name)) {
          Object.defineProperty(this, name, {
            set: function set(scope) {
              _this.set(name, scope);
            },
            get: function get(prop) {
              return _this.Storage[_arguments[0]];
            }
          });
        }

        if (sync) {
          try {
            var storage_value = null;

            if (isNode()) {
              Storage.getItem('SIMPLEX_' + name, function (result) {
                storage_value = JSON.parse(result);
                _this.Storage[name] = storage_value !== undefined && storage_value !== null ? storage_value : default_value;
              });
            } else {
              storage_value = JSON.parse(Storage.getItem('SIMPLEX_' + name));
              this.Storage[name] = storage_value !== undefined && storage_value !== null ? storage_value : default_value;
            }

            //let storage_value = JSON.parse( localStorage.getItem( 'SIMPLEX_' + name ) );
            //this.Storage[name] = storage_value !== undefined && storage_value !== null ? storage_value : default_value;
          } catch (e) {
            console.error('Simplex: can`t sync data from localStorage for ' + name);
          }
        }
      }
    }, {
      key: 'get',
      value: function get(name) {
        return this.Storage[name];
      }
    }, {
      key: 'update',
      value: function update(name, data) {
        var new_data = JSON.parse(JSON.stringify(Object.assign({}, this.Storage[name], data)));
        this.set(name, new_data);
      }
    }, {
      key: 'set',
      value: function set(name) {
        var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        this.Storage[name] = scope;

        if (this.sync[name]) {

          if (isNode()) {
            Storage.setItem('SIMPLEX_' + name, JSON.stringify(this.Storage[name]), function () {});
          } else {
            Storage.setItem('SIMPLEX_' + name, JSON.stringify(this.Storage[name]));
          }

          //localStorage.setItem( 'SIMPLEX_' + name, JSON.stringify( this.Storage[name] ) );
        }

        this.trigger(name);
      }
    }, {
      key: 'onChange',
      value: function onChange() {
        var name = '',
            callback = function callback() {};

        switch (arguments.length) {
          case 1:
            name = GLOBAL_EVENT_NAME;
            callback = arguments[0];
            break;
          case 2:
            name = arguments[0];
            callback = arguments[1];
            break;
        }
        this.listeners.push({ name: name, callback: callback });
      }
    }, {
      key: 'trigger',
      value: function trigger() {
        var _this2 = this;

        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : GLOBAL_EVENT_NAME;

        var result = null;

        this.listeners.forEach(function (event) {
          if (event.callback) {
            if (event.name.indexOf(GLOBAL_EVENT_NAME) === 0) {
              result = event.callback.call({}, _this2.Storage);
            } else {
              if (event.name.indexOf(name) === 0) {
                result = event.callback.call({}, _defineProperty({}, name, _this2.Storage[name]));
              }
            }
          }
        });

        return result;
      }
    }, {
      key: 'remove',
      value: function remove() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : GLOBAL_EVENT_NAME;

        for (var i in this.listeners) {
          if (this.listeners[i].name == name) {
            delete this.listeners[i];
          }
        }
        this.listeners = this.listeners.filter(function (e) {
          return e;
        });
      }
    }]);

    return SimplexStorage;
  }();

  var Simplex = new SimplexStorage();

  function SimplexMapToProps(Component, MapStorageToPropsFunction) {
    if (typeof MapStorageToPropsFunction != 'function') {
      MapStorageToPropsFunction = function MapStorageToPropsFunction(storage) {
        return JSON.parse(JSON.stringify(storage));
      };
    }

    var Connected = function (_React$Component) {
      _inherits(Connected, _React$Component);

      function Connected() {
        _classCallCheck(this, Connected);

        var _this3 = _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).call(this));

        _this3.state = MapStorageToPropsFunction(Simplex.Storage, _this3.props);
        return _this3;
      }

      _createClass(Connected, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
          var newMappedProps = MapStorageToPropsFunction(Simplex.Storage, newProps, this.state);
          if (!_underscore2.default.isEqual(this.state, newMappedProps)) {
            this.setState(newMappedProps);
          }
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this4 = this;

          Simplex.onChange(GLOBAL_EVENT_NAME + '.' + Key, function (storage) {
            var newMappedProps = MapStorageToPropsFunction(Simplex.Storage, _this4.props, _this4.state);
            if (!_underscore2.default.isEqual(_this4.state, newMappedProps)) {
              _this4.setState(newMappedProps);
            }
          });
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          Simplex.remove(GLOBAL_EVENT_NAME + '.' + Key);
        }
      }, {
        key: 'render',
        value: function render() {
          return React.createElement(Component, _extends({}, this.props, this.state));
        }
      }]);

      return Connected;
    }(React.Component);

    return Connected;
  }

  function SimplexConnect(Component) {
    var storageNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (!Array.isArray(storageNames)) {
      console.error('SimplexConnect props must be an array');
      return;
    }

    var Connected = function (_React$Component2) {
      _inherits(Connected, _React$Component2);

      function Connected(props) {
        _classCallCheck(this, Connected);

        var _this5 = _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).call(this));

        _this5.state = _underscore2.default.pick(Simplex, storageNames);
        return _this5;
      }

      _createClass(Connected, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this6 = this;

          storageNames.forEach(function (storageName) {
            Simplex.onChange(storageName + '.' + Key, function (storage) {

              var newState = _underscore2.default.pick(Simplex, storageNames);
              if (!_underscore2.default.isEqual(_this6.state, newState)) {
                _this6.setState(newState);
              }
            });
          });
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          storageNames.forEach(function (storageName) {
            Simplex.remove(storageName + '.' + Key);
          });
        }
      }, {
        key: 'render',
        value: function render() {
          return React.createElement(Component, _extends({}, this.props, this.state));
        }
      }]);

      return Connected;
    }(React.Component);

    return Connected;
  }

  return { Simplex: Simplex, SimplexConnect: SimplexConnect, SimplexStorage: SimplexStorage, SimplexMapToProps: SimplexMapToProps, Storage: Storage };
}(),
    Simplex = _ref.Simplex,
    SimplexConnect = _ref.SimplexConnect,
    SimplexStorage = _ref.SimplexStorage,
    SimplexMapToProps = _ref.SimplexMapToProps,
    Storage = _ref.Storage;

exports.Simplex = Simplex;
exports.SimplexConnect = SimplexConnect;
exports.SimplexStorage = SimplexStorage;
exports.SimplexMapToProps = SimplexMapToProps;
exports.Storage = Storage;