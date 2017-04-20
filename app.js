///////////////////BUDGET CONTROLLER//////////////////////
var budgetController = (function() {

  //Function contructor for expense objects.
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  //Calculate percentage. Method added to Expense prototype chain so all objects that come from it will have this method.
  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    } else {
      this.percentage = -1;
    }
  };

  //Return percentage.
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  //Function constructor for income objects.
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //Private function for calculations.
  var calculateTotal = function(type) {
    //Placeholder value.
    var sum = 0;
    //Loop over array[type], inc or exp, using current value (cur).
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });
    //Store value in global user data structure below.
    data.totals[type] = sum;
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
    },
    budget: 0,
    percentage: -1
  };

  //All public methods go here.
  return {
    //Global method to allow other modules to add items into data structure.
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

    //Item deletion method. Item IDs may be unordered(items can be deleted in any order), so create an array of all IDs and find index of the input ID(the one to delete).
    deleteItem: function(type, id) {
      var ids, index;
      //Create array of all IDs.
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      //Get needed item ID.
      index = ids.indexOf(id);
      //Delete item.
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    //Budget calculation contoller method.
    calculateBudget: function() {
      //Calc total income and expenses.
      calculateTotal('exp');
      calculateTotal('inc');
      //Calc budget: income - expenses.
      data.budget = data.totals.inc - data.totals.exp;
      //Calc percentage spent. If statement prevents strange results if number is 0.
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    //Calculate the percentages for all expenses.
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    //Get the percentages for all expenses. Using .map as it returns  and stores in a variable. Then return it;
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    //Return budget for later use in updateBudget function. Object used to return multiple values simultaneously.
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    test: function(){
      console.log(data);
    }
  };

})();

///////////////////UI CONTROLLER////////////////////////
var UIController = (function() {

  //Storage for strings from DOM.
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  //Formatting function.
  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    //.abs() returns absolute value.
    num = Math.abs(num);
    //.toFixed() returns a STRING to specified number of decimals.
    num = num.toFixed(2);
    //Split string at decimal; returns array of 2 elements.
    numSplit = num.split('.');
    //Before decimal.
    int = numSplit[0];
    //Add commas for thousands.
    if(int.length > 3) {
      //Get part of a string with substr method; add commas
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    //After decimal.
    dec = numSplit[1];
    //Return formatted string. Ternary operator rather than if statement.
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  //For loop that calls the callback on each iteration. Node list DOES have length property.
  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    //Method to return all three values at the same time via object.
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //Either inc or exp.
        description: document.querySelector(DOMStrings.inputDescription).value,
        //As a number
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    //Dynamically add items to the lists of incomes and expenses.
    addListItem: function(obj, type) {
      //Create HTML string with placeholder text.
      var html, newHtml, element;

      if(type === 'inc') {
        element = DOMStrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if(type === 'exp') {
        element = DOMStrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">              <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace placeholders with actual text.
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      //Insert the HTML into the DOM.
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    //Delete item from UI.
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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

    //Display budget in user UI.
    displayBudget: function(obj) {
      //Set type variable using ternary operator rather than if/else statement.
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      //Set the displayed content.
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      //If statement to deal with non-sensical display bug.
      if(obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },

    //Display percentages in each budget item in the UI.
    displayPercentages: function(percentages) {
      //This returns a node list, not an array.
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      //Call nodeListForEach function.
      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    //Get and display current month method.
    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      //getMonth() return a number so an array with names is needed.
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    //Change type method, handles color change.
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue
      );
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    //Expose DOMStrings object for use in other controllers.
    getDomStrings: function() {
      return DOMStrings;
    }
  };
})();

//////////////GLOBAL APP CONTROLLER//////////////////////
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

    //Set up event listener for item deletion; using event delegation.
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    //Detect change from income to expense.
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  //Updating the budget.
  var updateBudget = function() {
      //Calc budget
      budgetCtrl.calculateBudget();
      //Get budget; store in variable (only returned in getBudget method, not stored anywhere)
      var budget = budgetCtrl.getBudget();
      //Display budget
      UICtrl.displayBudget(budget);
  };

  //Updating the percentages within the app.
  var updatePercentages = function() {
    //Calc the percentages.
    budgetCtrl.calculatePercentages();
    //Get percentages from budget controller. Stored in variable for later use.
    var percentages = budgetCtrl.getPercentages();
    //Call displayPercentages method.
    UICtrl.displayPercentages(percentages);
  };

  //Adding new items.
  var ctrlAddItem = function() {
    var input, newItem;
    //Get input data via getInput method on UIController object.
    input = UICtrl.getInput();
    //If statement to prevent empty, 0, or NaN items being added to budget.
    if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
      //Add item to budget CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //Add item to the UI
      UICtrl.addListItem(newItem, input.type);
      //Clear the fields
      UICtrl.clearFields();
      //Calculate and update budget
      updateBudget();
      //Call updatePercentages function.
      updatePercentages();
    }
  };

  //Delete item function. Get event target, traverse DOM, get ID of the item we want and store it in the variable.
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    //Traverse DOM to get id.
     itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
     //Split item id into usable pieces.
     if(itemID) {
       splitID = itemID.split('-');
       type = splitID[0];
       //ParseInt to change string into a number to avoid deletion method from Budget Controller always returning false on its if statement(comparing number to string).
       ID = parseInt(splitID[1]);
       //Call item deletion method from Budget Controller, passing it variables from just above.
       budgetCtrl.deleteItem(type, ID);
       //Call item deletion for the UI method from UI controller.
       UICtrl.deleteListItem(itemID);
       //Update budget method.
       updateBudget();
       //Call updatePercentages function.
       updatePercentages();
     }
  };

  //Globally available method to call eventListeners function.
  return {
    init: function() {
      console.log("App is running.");
      UICtrl.displayMonth();
      //Set all initial values to zero on load.
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);

//Immediately called so that event listeners are available; app non functional otherwise.
controller.init();
