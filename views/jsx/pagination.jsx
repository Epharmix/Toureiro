var React = require('react');
var classnames = require('classnames');

var Pagination = React.createClass({

  getInitialState: function() {
    var state = {
      page: 0
    };
    return state;
  },

  changePage: function(page, event) {
    var _this = this;
    this.setState({
      page: page
    }, function() {
      if (_this.props.onPageChange) {
        _this.props.onPageChange(page);
      }
    });
  },

  render: function() {
    var _this = this;
    var pages = [];
    for (var i = 0; i < this.props.total; i++) {
      pages.push(i);
    }
    if (pages.length === 0) {
      pages.push(0);
    }
    return (
      <div className="pagination">
        <ul>
          <li className="previous">
            <a href="javascript:;" className="fui-arrow-left"></a>
          </li>
          {
            pages.map(function(page) {
              var pageClasses = classnames({
                active: _this.state.page === page
              });
              return (
                <li className={pageClasses} key={page}>
                  <a href="javascript:;" onClick={_this.changePage.bind(_this, page)}>{page + 1}</a>
                </li>
              );
            })
          }
          <li className="next">
            <a href="javascript:;" className="fui-arrow-right"></a>
          </li>
        </ul>
      </div>
    );
  }

});

module.exports = Pagination;