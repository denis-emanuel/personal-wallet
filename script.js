'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2021-10-17T16:33:06.386Z',
    '2021-10-18T14:43:26.374Z',
    '2021-10-19T18:49:59.371Z',
    '2021-10-20T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / 1000 / 60 / 60 / 24);

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  //the old
  // return `${date.getDate().toString().padStart(2, '0')}.${(
  //   date.getMonth() + 1
  // )
  //   .toString()
  //   .padStart(2, '0')}.${date.getFullYear()}`;
  else return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  const formattedMov = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
  return formattedMov;
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; //similar to text content, we got to empty the container before using it to delete the hardcoded values from the code before

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    const containerMovementsHTML = `
     <div class="movements__row">
       <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
       <div class="movements__date">${displayDate}</div>
       <div class="movements__value">${formattedMov}</div>
     </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', containerMovementsHTML); //'afterbegin' = each new element is added at the top, so before the old ones, so you can see the newer transactions first
    [...document.querySelectorAll('.movements__row')].forEach(function (
      row,
      i
    ) {
      if (i % 2 === 0) row.style.backgroundColor = '#FAFAFA';
      else row.style.backgroundColor = '#ECECEC';
    });
  });
};

// console.log(containerMovements.innerHTML); //that's the 'containerMovementsHTML' that we created

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${formatCurrency(
    account.balance,
    account.locale,
    account.currency
  )}`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCurrency(
    incomes,
    account.locale,
    account.currency
  )}`;

  const outs = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCurrency(
    outs,
    account.locale,
    account.currency
  )}`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(interest => interest >= 1) //bank gives interest only if interest is >= 1
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${formatCurrency(
    interest,
    account.locale,
    account.currency
  )}`;
};

// The username in this app is basically all the initials put together
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner //acc.username is newly created
      .toLowerCase()
      .split(' ')
      .map(nick => nick[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function () {
  calcDisplaySummary(currentAccount);
  calcDisplayBalance(currentAccount);
  displayMovements(currentAccount);
};

const overallBalance = function () {
  const bankOverallBalance = accounts
    .map(acc => acc.movements)
    .flat()
    .reduce((acc, mov) => acc + mov, 0);

  return bankOverallBalance;
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = Math.floor(time / 60);
    const sec = time % 60;

    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${String(min).padStart(2, '0')}:${String(
      sec
    ).padStart(2, '0')}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.value = 'Log in to get started';
    }

    time--;
  };
  // Set time to 10 minutes
  let time = 10 * 60;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  // When time=0 seconds, stop timer and log out user
  return timer;
};

//EVENT HANDLERS

let currentAccount, timer;

btnLogin.addEventListener('click', function (event) {
  event.preventDefault(); //prevents the form from submitting

  //The old way
  // const now = new Date();
  // labelDate.textContent = `${now.getDate().toString().padStart(2, '0')}.${(
  //   now.getMonth() + 1
  // )
  //   .toString()
  //   .padStart(2, '0')}.${now.getFullYear()}, ${now
  //   .getHours()
  //   .toString()
  //   .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  //The new way

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  const now = new Date();
  const locale = currentAccount.locale; //navigator.locale for the browser locale
  const dateOptions = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  labelDate.textContent = new Intl.DateTimeFormat(locale, dateOptions).format(
    now
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    //display UI and a welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); //lose its focus if logging using enter instead of click

    if (timer) clearInterval(timer); //clear the timer to not overlap over multiple consecutive logins
    timer = startLogOutTimer();
    // display movements, display balance, display summary
    updateUI();
  }
});

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    receiver &&
    currentAccount.balance >= amount &&
    receiver?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);
    receiver.movementsDates.push(new Date().toISOString());

    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI();

    //Reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// rule, get a loan is there's any deposit of at least 10% of the value of the loan
btnLoan.addEventListener('click', function (event) {
  event.preventDefault();

  const loanAmount = +Math.floor(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= 0.1 * loanAmount)
  ) {
    setTimeout(function () {
      currentAccount.movementsDates.push(new Date().toISOString());
      currentAccount.movements.push(loanAmount);
      updateUI();
      inputLoanAmount.value = inputLoginPin.value = '';
    }, 3000);

    clearInterval(timer);
    timer = startLogOutTimer();
  } else alert('Load value too high');
});

btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const deleteIndex = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    accounts.splice(deleteIndex, 1);
    containerApp.style.opacity = 0; //hide UI
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/////////////////////////////////////////////////
/////////////////////////////////////////////////

// console.log(0.1 + 0.2 === 0.3); //false

// console.log(Number.parseInt('30px', 10)); //base 10
// console.log(Number.parseInt('e32', 10));

// console.log(Number.parseFloat('  2.5rem  '));
// console.log(Number.parseInt('   2.5rem  '));
// console.log(parseFloat('2.5rem'));

// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20x'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(20 / 0));

// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(20 / 0));
// console.log(Number.isInteger(0.1 + 0.2));

// console.log(32314214217482173872173982131n);
// console.log(BigInt(32314214217482173872173982131));
// console.log(20n === 20); //false

// console.log(11n / 3n); //3n
// console.log(11 / 3); //3.666

//---------------------------------------------------------
// // Create a date

// const now = new Date();
// console.log(now);

// console.log(new Date('December 24, 2020'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 23, 5));
// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); //ms

// working with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth() + 1);
// console.log(future.getDate()); //day of the month
// console.log(future.getDay()); //day of the week
// console.log(future.toISOString());

// console.log(future.getTime()); //no of ms
// console.log(new Date(2142249780000));

// console.log(Date.now());

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(Number(future)); //timestamp in ms

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / 1000 / 60 / 60 / 24;
// console.log(calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4)));

// const num = 3221321413.23;
// const options = {
//   style: 'unit', //currency,
//   unit: 'celsius',
// };

// console.log('US:', new Intl.NumberFormat('en-US', options).format(num));
// console.log('DE:', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('RO:', new Intl.NumberFormat('ro-RO', options).format(num));

///////////////////////////////////////////////////////////
// TIMERS
///////////////////////////////////////////////////////////
// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza 🍕 with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting boy');

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// interval
// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);
