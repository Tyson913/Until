
/*

    Ajaw basaha ang code if allergic ka sa spaghetti

*/



import { addDays, addWeeks, addMonths, addYears } from "https://cdn.jsdelivr.net/npm/date-fns@4/+esm";

const form = document.getElementById("ftForm");
let mode = "default";
let prodName;
let prodQuan;
let prodCurr;
let prodPrice;
let unitPrice;
let savingsFreq;
let savingsCurr;
let savingsAm;
let estimatedTimePur;
let neededAmount;
let startingDate;
let mess;

const savplanGenBttn = document.getElementById("gensavplanbuttn");

const resbox1 = document.getElementById("resultboxFETCalc");
const resbox2 = document.getElementById("resultboxSavPlanGen");

form.addEventListener("submit", function (e) {
    e.preventDefault();
    prodName = document.getElementById("prodName").value.trim();
    prodQuan = Number(document.getElementById("prodQuan").value);
    prodCurr = document.getElementById("prodCurr").value;
    prodPrice = Number(document.getElementById("prodPrice").value);
    savingsFreq = document.getElementById("savFreq").value;
    savingsCurr = document.getElementById("savCurr").value;
    savingsAm = Number(document.getElementById("savAm").value);


    if (mode === "default") {
        [estimatedTimePur, neededAmount] = defFETCalc(
            prodQuan,
            prodCurr,
            prodPrice,
            savingsCurr,
            savingsFreq,
            savingsAm
        );
        fillResBox1(
            prodName,
            prodQuan,
            prodCurr,
            prodPrice,
            savingsCurr,
            savingsFreq,
            savingsAm,
            estimatedTimePur,
            neededAmount
        );
        resbox1.style.display = 'flex';
        form.reset();
    }
    else {

        startingDate = new Date(document.getElementById("targetPurDate").value);

        let endingDate;
        let timeNeeded;
        [endingDate, timeNeeded] = savplanGen(
            prodName,
            prodQuan,
            prodCurr,
            prodPrice,
            startingDate,
            savingsCurr,
            savingsFreq,
            savingsAm
        );

        startingDate = String(startingDate).slice(4, 15);
        endingDate = String(endingDate).slice(4, 15);
        fillResBox2(
            prodName,
            timeNeeded,
            prodQuan,
            prodCurr,
            prodPrice,
            startingDate,
            endingDate,
            savingsCurr,
            savingsFreq,
            savingsAm
        );
        resbox2.style.display = 'flex';
        form.reset();
    }
});

const currencySigns = {
    php: "₱",
    usd: "$",
    eur: "€",
    cny: "¥",
    jpy: "¥",
    gbp: "£"
};


const etpFreq = {
    daily: "days",
    weekly: "weeks",
    monthly: "months",
    yearly: "years",
};


const AmountConvertion = {
    php: {
        usd: 0.01644,
        eur: 0.01421,
        cny: 0.11139,
        jpy: 2.63406,
        gbp: 0.01225
    },

    usd: {
        php: 60.83,
        eur: 0.8643,
        cny: 6.776,
        jpy: 160.23,
        gbp: 0.7454
    },

    eur: {
        php: 70.3806,
        usd: 1.1570,
        eur: 1,
        cny: 7.8398,
        jpy: 185.387,
        gbp: 0.8624
    },

    cny: {
        php: 8.9772,
        usd: 0.14757,
        eur: 0.12755,
        jpy: 23.6466,
        gbp: 0.1100
    },

    jpy: {
        php: 0.3796,
        usd: 0.006241,
        eur: 0.005394,
        cny: 0.042289,
        gbp: 0.004652
    },

    gbp: {
        php: 81.607,
        usd: 1.3415,
        eur: 1.1595,
        cny: 9.0904,
        jpy: 214.958
    }
};




savplanGenBttn.addEventListener("click", function () {
    const savstartdateCon = document.getElementById("savstartdate");

    if (savstartdateCon.style.display === "flex") {
        savstartdateCon.style.display = "none";
        resbox2.style.display = "none";
        mode = "default";
        savplanGenBttn.textContent = "Generate Savings Plan";
    } else {
        savstartdateCon.style.display = "flex";
        resbox1.style.display = "none";
        mode = "savPlanGen";
        savplanGenBttn.textContent = "Back To Default Mode";
    }
});

function defFETCalc(
    prodQuantity,
    priceCurrency,
    unitPrice,
    savingsCurrency,
    savingsFreq,
    savingsAmount
) {
    let totalPrice;
    let initET = 0;
    let fet;
    let neededAm;
    let initPrice;

    if (savingsCurrency === priceCurrency) {
        totalPrice = unitPrice * prodQuantity;
        if (totalPrice > savingsAmount) {
            initET = totalPrice / savingsAmount;
        }
    }
    else {
        initPrice = unitPrice * prodQuantity;

        totalPrice = initPrice * AmountConvertion[priceCurrency][savingsCurrency];


        if (totalPrice > savingsAmount) {
            initET = totalPrice / savingsAmount;
        }
    }

    if (savingsAmount >= totalPrice) {
        mess = document.createElement('div');
        mess.textContent = "Your balance is enough to buy the product right now";
        mess.classList.add("messageBox");
        return [0, 0]
    }

    if (!Number.isInteger(initET)) {
        fet = Math.trunc(initET);
        neededAm = Math.trunc(totalPrice - (fet * savingsAmount));
    }
    else {
        fet = initET;
        neededAm = 0;
    }
    return [fet, neededAm];
}


function savplanGen
    (
        productName,
        prodQuantity,
        priceCurrency,
        unitPrice,
        startingDate,
        savingsCurrency,
        savingsFreq,
        savingsAmount
    ) {

    let fSavingsTimeEnd;
    let analysis;
    let analIndex;

    const [fet] = defFETCalc(
        prodQuantity,
        priceCurrency,
        unitPrice,
        savingsCurrency,
        savingsFreq,
        savingsAmount
    )

    const timeNeeded = fet;


    if (savingsFreq === "daily") {
        fSavingsTimeEnd = addDays(startingDate, timeNeeded);
    }
    else if (savingsFreq === "weekly") {
        fSavingsTimeEnd = addWeeks(startingDate, timeNeeded);
    }
    else if (savingsFreq === "monthly") {
        fSavingsTimeEnd = addMonths(startingDate, timeNeeded);
    }
    else {
        fSavingsTimeEnd = addYears(startingDate, timeNeeded);
    }

    return [fSavingsTimeEnd, timeNeeded];
}

function fillResBox1(
    productName,
    prodQuantity,
    priceCurrency,
    unitPrice,
    savingsCurrency,
    savingsFreq,
    savingsAmount,
    estimatedTimePur,
    neededAmount
) {
    const pn = document.getElementById("pn");
    const pquan = document.getElementById("pquan");
    const up = document.getElementById("up");
    const sf = document.getElementById("sf");
    const sa = document.getElementById("sa");
    const etp = document.getElementById("etp");
    pn.textContent = productName;
    pquan.textContent = prodQuantity;
    up.textContent = `${currencySigns[priceCurrency]}${unitPrice}`;
    sf.textContent = savingsFreq;
    sa.textContent = `${currencySigns[savingsCurrency]}${savingsAmount}`;

    if (neededAmount > 0) {
        etp.textContent = ` ${estimatedTimePur} ${etpFreq[savingsFreq]} and extra ${currencySigns[savingsCurrency]}${neededAmount} needed.`;
    }
    else {
        etp.textContent = ` ${estimatedTimePur} ${etpFreq[savingsFreq]}.`;
    }
}

const analBox1 = document.getElementById("startingDateCon");
const analBox2 = document.getElementById("endingDateCon");
const analText = document.getElementById("analText");


function fillResBox2(
    productName,
    timeNeeded,
    prodQuantity,
    priceCurrency,
    unitPrice,
    startingDate,
    endingDate,
    savingsCurrency,
    savingsFreq,
    savingsAmount
) {
    const pn2 = document.getElementById("pn2");
    const pquan2 = document.getElementById("pquan2");
    const up2 = document.getElementById("up2");
    const sf2 = document.getElementById("sf2");
    const sa2 = document.getElementById("sa2");
    const etp2 = document.getElementById("etp2");

    pn2.textContent = productName;
    pquan2.textContent = prodQuantity;
    up2.textContent = `${currencySigns[priceCurrency]}${unitPrice}`;
    sf2.textContent = savingsFreq;
    sa2.textContent = `${currencySigns[savingsCurrency]}${savingsAmount}`;

    const formattedSavingsAmount = `${currencySigns[savingsCurrency]}${savingsAmount}`;
    const formattedUnitPrice = `${currencySigns[priceCurrency]}${unitPrice}`;
    let analIndex;
    let analysis;
    const productText = `${prodQuantity} ${productName}`;
    const unitText = prodQuantity === 1 ? "" : " each";


    const timeHighlight = `<span class="timeHiglight">${timeNeeded} ${etpFreq[savingsFreq]}</span>`;
    const analTexts = [
        `Given your current savings of ${formattedSavingsAmount} and the planned purchase of ${productText} at ${formattedUnitPrice}${unitText}, you have ${timeHighlight}, from ${startingDate} to ${endingDate}, to save toward your goal.`,

        `With ${formattedSavingsAmount} already saved, you have ${timeHighlight} to accumulate funds for ${productText} at ${formattedUnitPrice}${unitText}, between ${startingDate} and ${endingDate}.`,

        `Your current savings total ${formattedSavingsAmount}, and you intend to purchase ${productText} at ${formattedUnitPrice}${unitText}. You have ${timeHighlight} to reach your target.`,

        `Based on your existing savings of ${formattedSavingsAmount}, you have ${timeHighlight} to prepare for the purchase of ${productText} valued at ${formattedUnitPrice}${unitText}.`,

        `You have already saved ${formattedSavingsAmount} toward ${productText} costing ${formattedUnitPrice}${unitText}. The savings period extends from ${startingDate} to ${endingDate}.`,

        `Considering your current savings balance of ${formattedSavingsAmount}, you have ${timeHighlight} to save for ${productText} priced at ${formattedUnitPrice}${unitText}.`,

        `The planned purchase of ${productText} is based on a price of ${formattedUnitPrice}${unitText}, and your savings currently amount to ${formattedSavingsAmount}. You have ${timeHighlight} to continue saving.`,

        `Starting with ${formattedSavingsAmount} in savings, you have a ${timeHighlight} period to work toward purchasing ${productText} valued at ${formattedUnitPrice}${unitText}.`,

        `Your savings stand at ${formattedSavingsAmount}, while your target purchase is ${productText} at ${formattedUnitPrice}${unitText}. The available timeframe is ${timeHighlight}.`,

        `With a savings balance of ${formattedSavingsAmount}, you have until ${endingDate} to save for ${productText} priced at ${formattedUnitPrice}${unitText}.`,

        `You currently have ${formattedSavingsAmount} saved and are planning to purchase ${productText} at ${formattedUnitPrice}${unitText} within the next ${timeHighlight}.`,

        `To purchase ${productText} costing ${formattedUnitPrice}${unitText}, you have ${timeHighlight} from ${startingDate} to continue building your savings.`,

        `Given your starting savings of ${formattedSavingsAmount}, purchasing ${productText} priced at ${formattedUnitPrice}${unitText} can be your goal over the next ${timeHighlight}.`,

        `Your financial objective is to acquire ${productText} valued at ${formattedUnitPrice}${unitText}. With ${formattedSavingsAmount} already saved, you have ${timeHighlight} remaining.`,

        `As of ${startingDate}, your savings total ${formattedSavingsAmount}. You have until ${endingDate} to save for ${productText} costing ${formattedUnitPrice}${unitText}.`,

        `The planned purchase is ${productText} at ${formattedUnitPrice}${unitText}, and your current savings amount is ${formattedSavingsAmount}. You have ${timeHighlight} available.`,

        `With ${formattedSavingsAmount} already accumulated, you have ${timeHighlight} to continue saving for ${productText} priced at ${formattedUnitPrice}${unitText}.`,

        `Your current savings amount of ${formattedSavingsAmount} serves as the starting point for a ${timeHighlight} savings plan toward ${productText} worth ${formattedUnitPrice}${unitText}.`,

        `The purchase target is ${productText} priced at ${formattedUnitPrice}${unitText}, and your current savings amount is ${formattedSavingsAmount}.`,

        `Starting from a savings balance of ${formattedSavingsAmount}, you have a ${timeHighlight} window to work toward buying ${productText} valued at ${formattedUnitPrice}${unitText}.`,

        `A total of ${timeHighlight} is available for saving toward ${productText} priced at ${formattedUnitPrice}${unitText}, beginning on ${startingDate}.`,

        `Your savings objective centers on ${productText} valued at ${formattedUnitPrice}${unitText}. Having already saved ${formattedSavingsAmount}, you have ${timeHighlight} remaining.`,

        `With an initial savings amount of ${formattedSavingsAmount}, the period between ${startingDate} and ${endingDate} offers time to prepare for ${productText} priced at ${formattedUnitPrice}${unitText}.`,

        `You have accumulated ${formattedSavingsAmount} so far and plan to purchase ${productText} worth ${formattedUnitPrice}${unitText}. The available savings timeframe is ${timeHighlight}.`,

        `As you work toward purchasing ${productText} valued at ${formattedUnitPrice}${unitText}, your existing savings of ${formattedSavingsAmount} provide the starting point for a ${timeHighlight} savings period.`,

        `Your goal is to purchase ${productText} priced at ${formattedUnitPrice}${unitText}. With ${formattedSavingsAmount} already saved and ${timeHighlight} available between ${startingDate} and ${endingDate}, you can continue progressing toward your target.`
    ];

    const convertionsButtons = [];

    for (const [key, value] of Object.entries(etpFreq)) {
        if (value != etpFreq[savingsFreq]) {
            convertionsButtons.push({
                text: `convert to ${value}`,
                action: `convert_to_${value}`
            })
        }
    }

    const convertionMenu = `
    <div class="wrapper">
        <div id= "convertionMenu" style="display: none;">
            ${convertionsButtons.map(a => `
                <button 
                class="convertionButtons"
                data-action="${a.action}">
                    ${a.text}
                </button>

                `).join("")}
        </div>
    </div>
    `;

    analIndex = Math.floor(Math.random() * 27);
    analysis = analTexts[analIndex];

    analBox1.textContent = startingDate;
    analBox2.textContent = endingDate;
    analText.innerHTML = analysis;




    const timeHighlightElem = document.querySelector(".timeHiglight");

    timeHighlightElem.insertAdjacentHTML(
        "beforeend",
        convertionMenu
    );
    const convertionMenuElem = document.getElementById("convertionMenu");

    timeHighlightElem.addEventListener("mouseenter", () => {
        convertionMenuElem.style.display = 'flex';
    });

    timeHighlightElem.addEventListener("mouseleave", () => {
        convertionMenuElem.style.display = 'none';
    });
}

/*

To-Do

Add input validation (forgotten / missed)
Add a button to return to the original analysis state
Add conversion functionality per action
Update the time highlight accordingly

// Add web app description
// Enhance the UI
// Deploy

*/
