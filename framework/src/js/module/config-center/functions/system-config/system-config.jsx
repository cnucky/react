const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('underscore');

import {getConfigList,updateConfigItems} from './services.jsx';
require('./style.css');

class Products extends React.Component {

  constructor(props) {
    super(props);

    //  this.state.products = [];
    this.state = {};
    this.state.filterText = "";

    this.state.products = [];
  };

  componentDidMount(){
    getConfigList().then((rspData) => {
      this.setState({products: rspData});

      //记录初始的配置值
      this.initProducts = [];
      this.state.products.forEach((value) => {
        this.initProducts.push(_.clone(value))
      })

      const containerHeight =  window.innerHeight - $('#st-container').offset().top;
      $('#systemConfigContainer').css({'min-height':containerHeight+'px'});
    })
  };

  handleUserInput(filterText) {
    this.setState({filterText: filterText});
  };

  // handleRowDel(product) {
  //   var index = this.state.products.indexOf(product);
  //   this.state.products.splice(index, 1);
  //   this.setState(this.state.products);
  // };

  // handleAddEvent(evt) {
  //   var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
  //   var product = {
  //     id: id,
  //     description: "",
  //     value: "",
  //     validateCondition: "",
  //     key:''
  //   }
  //   this.state.products.push(product);
  //   this.setState(this.state.products);

  // }

  handleProductTable(evt) {
    var item = {
      key: evt.target.id,
      type: evt.target.name,
      value: evt.target.value,
    };
var products = this.state.products.slice();
  var newProducts = products.map(function(product) {

    for (var objectKey in product) {
      if (objectKey == item.type && product.key == item.key) {
        product[objectKey] = item.value;

      }
    }
    return product;
  });
    this.setState({products:newProducts});
  };

  handleSubmitChanges(evt) {
    const modifiedItems = { newConfigList:this.getModifiedItems() };
    updateConfigItems(modifiedItems).then((rsp) => {
    });
  }

  getModifiedItems(){
    let modifiedItems = [];
    this.state.products.forEach((item) => {
      const initItem = _.find(this.initProducts,(val) =>{
        return val.key == item.key; 
      });
      if(initItem){

        if(initItem.value != item.value){
          //modified item
          modifiedItems.push(item);
        }
      }
    });
    return modifiedItems;
  }

  render() {

    return (
      <div id='systemConfigContainer'>
        <SearchBar filterText={this.state.filterText} onUserInput={this.handleUserInput.bind(this)}/>
        <ProductTable onProductTableUpdate={this.handleProductTable.bind(this)} products={this.state.products} filterText={this.state.filterText} onSubmitChanges={this.handleSubmitChanges.bind(this)} />
        
      </div>
    );

  }

}
class SearchBar extends React.Component {
  handleChange() {
    this.props.onUserInput(this.refs.filterTextInput.value);
  }
  render() {
    return (
      <div className='sys-conf-80width'>

        <input type="text" placeholder="Search..." value={this.props.filterText} ref="filterTextInput" onChange={this.handleChange.bind(this)}/>

      </div>

    );
  }

}

class ProductTable extends React.Component {

  render() {
    var onProductTableUpdate = this.props.onProductTableUpdate;
    var rowDel = this.props.onRowDel;
    var filterText = this.props.filterText;
    var product = this.props.products.map(function(product) {
      if (product.description.indexOf(filterText) === -1) {
        return;
      }
      return (<ProductRow onProductTableUpdate={onProductTableUpdate} product={product}  key={product.key}/>)
    });
    
    return (
      <div className='sys-conf-80width'>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>配置项描述</th>
              <th>配置项值</th>
              <th>值区间</th>
              <th>所属模块</th>
            </tr>
          </thead>

          <tbody>
            {product}

          </tbody>

        </table>
        <button type="button" onClick={this.props.onSubmitChanges} className="btn btn-success pull-right">Submit</button>
      </div>
    );

  }

}

class ProductRow extends React.Component {
  onDelEvent() {
    this.props.onDelEvent(this.props.product);

  }
  render() {

    return (
      <tr className="eachRow">
        <NonEditableCell cellData={{
          "type": "description",
          value: this.props.product.description,
          id: this.props.product.key
        }}/>
        <EditableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
          type: "value",
          value: this.props.product.value,
          id: this.props.product.key
        }}/>
        <NonEditableCell cellData={{
          type: "validateCondition",
          value: this.props.product.validateCondition,
          id: this.props.product.key
        }}/>
        <NonEditableCell cellData={{
          type: "module",
          value: this.props.product.module,
          id: this.props.product.key
        }}/>

        
      </tr>
    );

  }

}
class EditableCell extends React.Component {

  render() {
    return (
      <td>
        <input type='text' name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate}/>
      </td>
    );

  }

}

class NonEditableCell extends React.Component {

  render() {
    return (
      <td>
        <p name={this.props.cellData.type} id={this.props.cellData.id}>{this.props.cellData.value}</p>
      </td>
    );

  }

}

const systemComfigFunction = {
  component: Products,
  componentDisplayName: '系统配置',
  key: 'systemComfigFunction'
};

export {systemComfigFunction};
// ReactDOM.render( < Products / > , document.getElementById('container'));

/*
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/