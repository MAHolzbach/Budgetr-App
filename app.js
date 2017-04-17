//BUDGET CONTROLLER
var budgetController = (function() {

  //Function contructor for expense objects.
  var Expense = function(id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value;
  };

  //Function constructor for income objects.
  var Income = function(id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value;
  };

  //Object to store user data. Nested objects for brevity.
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  //Global method to allow other modules to add items into data structure.
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //Unique ID number for each input. Identify type; get last index number of appropriate array(in event of deletions); assign an ID (.id + 1); if/else statement to avoid 'undefined' error when array is empty.
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new exp or inc object based on user input.
      if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val);
      }
      //Select appropriate array and add data.
      data.allItems[type].push(newItem);
      //Allow global access to new item.
      return newItem;
    },
    getData: function(){
      console.log(data);
    }
  };

})();

//UI CONTROLLER
var UIController = (function() {

  //Storage for strings from DOM if needed for changes.
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list'
  };

  return {
    //Method to return all three values at the same time via object.
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //Either inc or exp.
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: document.querySelector(DOMStrings.inputValue).value
      };
    },

    //Dynamically add items to the lists of incomes and expenses.
    addListItem: function(obj, type) {
      //Create HTML string with placeholder text.
      var html, newHtml, element;

      if(type === 'inc') {
        element = DOMStrings.incomeContainer;

        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if(type === 'exp') {
        element = DOMStrings.expensesContainer;

        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix">              <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace placeholder with actual text.
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);
      //Insert the HTML into the DOM.
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    //Clear the input fields after an item is added.
    clearFields: function() {
      var fields, fieldsArr;
      //Assign input fields to a variable. Comma needed to select multiple strings.
      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
      //querySelectorAll returns a list; .slice returns an array, as needed. Use the Array prototype (where .slice can be accessed), .call to set 'this' variable.
      fieldsArr = Array.prototype.slice.call(fields);
      //.forEach method, faster than a normal for loop. Clear all items using empty string.
      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });
      //Return focus to description input field after an item is added.
      fieldsArr[0].focus();
    },

    //Expose DOMStrings object for use in other controllers.
    getDomStrings: function() {
      return DOMStrings;
    }
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  //Overall function to handle event listeners.
  var setupEventListeners = function() {
    //Call getDomStrings method of UIController to make them available inside this controller.
    var DOM = UIController.getDomStrings();
    //Add listener for adding items to budget on button click.
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    //Add listener for adding items to budget on pressing enter key.
    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //Get input data via getInput method on UIController object.
    input = UICtrl.getInput();
    //Add item to budget CONTROLLER
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //Add item to the UI
    UICtrl.addListItem(newItem, input.type);
    //Clear the fields
    UICtrl.clearFields();
    //Calc budget

    //Display budget

  };

  //Globally available method to call eventListeners function.
  return {
    init: function() {
      console.log("App is running.")
      setupEventListeners();
    }
  };

})(budgetController, UIController);

//Immediately called so that event listeners are available; app non functional otherwise.
controller.init();
