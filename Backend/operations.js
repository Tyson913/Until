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
let currBalance;
let BalCurrency;

const savplanGenBttn = document.getElementById("gensavplanbuttn");
const savplanGenBttnIcon = document.getElementById("gensavplanbuttnIcon");
const savplanGenBttnLabel = document.getElementById("gensavplanbuttnLabel");

const resbox1 = document.getElementById("resultboxFETCalc");
const resbox2 = document.getElementById("resultboxSavPlanGen");


function revealResultBox(box) {
    const alreadyVisible = box.style.display === "flex";

    box.style.display = "flex";

    if (alreadyVisible) {
        box.classList.remove("is-updated");
        void box.offsetWidth;
        box.classList.add("is-updated");
        box.addEventListener("animationend", () => {
            box.classList.remove("is-updated");
        }, { once: true });
    }

    box.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

const etpFreq = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
};

const sfreq = document.getElementById("sfreqlabel");
const savFreqDropdown = document.getElementById("savFreq");

function updateFreqLabel() {
    sfreq.textContent = etpFreq[savFreqDropdown.value] || "";
}
savFreqDropdown.addEventListener("change", updateFreqLabel);

updateFreqLabel();

const messBoxCon = document.getElementById("messBoxCon");
let messageDismissScrollHandler = null;
let messageLeaveAnimHandler = null;

function showMessageBox() {
    let mess = messBoxCon.querySelector(".messageBox");

    if (!mess) {
        mess = document.createElement('div');
        mess.classList.add("messageBox");
        mess.setAttribute("role", "status");
        mess.setAttribute("aria-live", "polite");
        mess.textContent = "Your balance is enough to buy the product right now!!";

        const scrollText = document.createElement('small');
        scrollText.textContent = "Scroll to dismiss";
        mess.appendChild(scrollText);

        messBoxCon.appendChild(mess);
    }


    if (messageLeaveAnimHandler) {
        mess.removeEventListener("animationend", messageLeaveAnimHandler);
        messageLeaveAnimHandler = null;
    }
    mess.classList.remove("is-leaving");


    mess.style.animation = "none";
    void mess.offsetWidth;
    mess.style.animation = "";

    messBoxCon.style.display = "flex";

    if (messageDismissScrollHandler) {
        window.removeEventListener("scroll", messageDismissScrollHandler);
    }
    messageDismissScrollHandler = () => dismissMessageBox(mess);
    window.addEventListener("scroll", messageDismissScrollHandler, { once: true });
}

function dismissMessageBox(mess) {
    if (mess.classList.contains("is-leaving")) return;

    mess.classList.add("is-leaving");
    messageLeaveAnimHandler = () => {
        messBoxCon.style.display = "none";
        mess.classList.remove("is-leaving");
        messageLeaveAnimHandler = null;
    };
    mess.addEventListener("animationend", messageLeaveAnimHandler, { once: true });
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    prodName = document.getElementById("prodName").value.trim();
    prodQuan = Number(document.getElementById("prodQuan").value);
    prodCurr = document.getElementById("prodCurr").value;
    prodPrice = Number(document.getElementById("prodPrice").value);
    savingsFreq = document.getElementById("savFreq").value;
    savingsCurr = document.getElementById("savCurr").value;
    savingsAm = Number(document.getElementById("savAm").value);
    currBalance = Number(document.getElementById("currBalance").value);
    BalCurrency = document.getElementById("savBalanceCurr").value;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    if (mode === "default") {
        [estimatedTimePur, neededAmount] = defFETCalc(
            prodQuan,
            prodCurr,
            prodPrice,
            savingsCurr,
            savingsFreq,
            savingsAm,
            currBalance,
            BalCurrency
        );
        console.log(estimatedTimePur, neededAmount);
        if (estimatedTimePur !== 0 && neededAmount !== 0) {
            fillResBox1(
                prodName,
                prodQuan,
                prodCurr,
                prodPrice,
                savingsCurr,
                savingsFreq,
                savingsAm,
                estimatedTimePur,
                neededAmount,
                currBalance,
                BalCurrency
            );
            revealResultBox(resbox1);
        }
        else {
            showMessageBox();
        }
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
            savingsAm,
            currBalance,
            BalCurrency
        );
        form.reset();
        revealResultBox(resbox2);
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
        savplanGenBttnIcon.className = "fa-solid fa-list-check";
        savplanGenBttnLabel.textContent = "Generate savings plan";
    } else {
        savstartdateCon.style.display = "flex";
        resbox1.style.display = "none";
        mode = "savPlanGen";
        savplanGenBttnIcon.className = "fa-solid fa-rotate-left";
        savplanGenBttnLabel.textContent = "Back to default mode";
    }
});

function defFETCalc(
    prodQuantity,
    priceCurrency,
    unitPrice,
    savingsCurrency,
    savingsFreq,
    savingsAmount,
    currentBalance,
    balanceCurrency
) {
    let totalPrice;
    let initET = 0;
    let fet;
    let neededAm = 0;
    let initPrice;

    // Utruhon ang archi

    if (savingsCurrency === priceCurrency) {
        totalPrice = unitPrice * prodQuantity;
        if (totalPrice >= savingsAmount) {
            initET = totalPrice / savingsAmount;
        }
    }
    else {
        initPrice = unitPrice * prodQuantity;
        totalPrice = initPrice * AmountConvertion[priceCurrency][savingsCurrency];
        initET = totalPrice / savingsAmount;
    }


    if (currentBalance >= totalPrice) {
        return [0, 0];
    }

    if (!Number.isInteger(initET)) {
        fet = Math.trunc(initET);
        neededAm = Math.trunc(totalPrice - (fet * savingsAmount));
    }
    else {
        fet = initET;
    }

    if (balanceCurrency !== savingsCurrency) {
        currentBalance = currentBalance * AmountConvertion[balanceCurrency][savingsCurrency];
    }

    if (neededAm >= currentBalance) {
        neededAm = neededAm - currentBalance;
    }
    else {
        initET = (totalPrice - currentBalance) / savingsAmount;
        fet = Math.trunc(initET);
        neededAm = Math.trunc(totalPrice - (fet * savingsAmount));
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
    neededAmount,
    currentBalance,
    BalCurrency
) {
    const extraAm = document.getElementById("extraAm");
    const pn = document.getElementById("pn");
    const pquan = document.getElementById("pquan");
    const up = document.getElementById("up");
    const sf = document.getElementById("sf");
    const sa = document.getElementById("sa");
    const etp = document.getElementById("etp");
    const savFreqResLabel = document.getElementById("savfreqRes");
    const currBal = document.getElementById("cb");
    currBal.textContent = `${currencySigns[BalCurrency]}${currentBalance}`;
    pn.textContent = productName;
    pquan.textContent = prodQuantity;
    up.textContent = `${currencySigns[priceCurrency]}${unitPrice}`;
    sf.textContent = savingsFreq;

    document.getElementById("savfreqLabel").textContent =
        `Savings Deposit Amount Per ${etpFreq[savingsFreq]}: `;
    sa.textContent = `${currencySigns[savingsCurrency]}${savingsAmount}`;

    if (neededAmount > 0) {
        etp.textContent = `${estimatedTimePur} ${etpFreq[savingsFreq]}${etpFreq[savingsFreq] !== 1 ? "s" : ""}`;
        extraAm.textContent = `and extra ${currencySigns[savingsCurrency]}${neededAmount} needed.`;
    }
    else {
        etp.textContent = ` ${estimatedTimePur} ${etpFreq[savingsFreq]}${etpFreq[savingsFreq] !== 1 ? "s" : ""}.`;
    }

    const convertionsUnits = [];
    const estimatedTimeNeededLabel = `${estimatedTimePur} ${etpFreq[savingsFreq]}`;
    for (const [key, value] of Object.entries(etpFreq)) {
        if (value != etpFreq[savingsFreq]) {
            let equivalentVal;
            let equivalent;

            if (value === "day") {
                if (etpFreq[savingsFreq] === "week") {
                    equivalent = Math.trunc(estimatedTimePur * 7);
                    equivalentVal = `${equivalent} day${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "month") {
                    equivalent = Math.trunc(estimatedTimePur * 30);
                    equivalentVal = `${equivalent} day${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(estimatedTimePur * 365);
                    equivalentVal = `${equivalent} day${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }

            else if (value === "week") {
                if (etpFreq[savingsFreq] === "day") {
                    equivalent = Math.trunc(estimatedTimePur / 7);
                    equivalentVal = `${equivalent} week${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "month") {
                    equivalent = Math.trunc(estimatedTimePur * 4);
                    equivalentVal = `${equivalent} week${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(estimatedTimePur * 52);
                    equivalentVal = `${equivalent} week${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }

            else if (value === "month") {
                if (etpFreq[savingsFreq] === "day") {
                    equivalent = Math.trunc(estimatedTimePur / 30);
                    equivalentVal = `${equivalent} month${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "week") {
                    equivalent = Math.trunc(estimatedTimePur / 4);
                    equivalentVal = `${equivalent} month${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(estimatedTimePur * 12);
                    equivalentVal = `${equivalent} month${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }
            else {
                if (etpFreq[savingsFreq] === "day") {
                    equivalent = Math.trunc(estimatedTimePur / 365);
                    equivalentVal = `${equivalent} year${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "week") {
                    equivalent = Math.trunc(estimatedTimePur / 52);
                    equivalentVal = `${equivalent} year${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(estimatedTimePur / 12);
                    equivalentVal = `${equivalent} year${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }
        }
    }
    const convertions = `
        <div id="convertionsCon" style="display: none;">
            <div id="cvheader">Time Unit Convertions</div>
            ${convertionsUnits.map(a => `
            <div class="convertion">
                <label>
                    <span class="key">${a.estimatedTimeNeeded}</span>
                    <span class="val">${a.equivalent}</span>
                </label>
            </div>
            <div class="arrow"></div>
            `).join("")}
        </div>
    `;

    etp.insertAdjacentHTML(
        "beforeend",
        convertions
    );
    const convertionsElem = document.getElementById("convertionsCon");

    etp.addEventListener("mouseenter", () => {
        convertionsElem.style.display = 'flex';
    });
    etp.addEventListener("mouseleave", () => {
        convertionsElem.style.display = 'none';
    });

    let etpTooltipOpen = false;
    etp.addEventListener("click", (e) => {
        e.stopPropagation();
        etpTooltipOpen = !etpTooltipOpen;
        convertionsElem.style.display = etpTooltipOpen ? 'flex' : 'none';
    });
    document.addEventListener("click", () => {
        if (etpTooltipOpen) {
            etpTooltipOpen = false;
            convertionsElem.style.display = 'none';
        }
    });
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
    savingsAmount,
    currentBalance,
    BalCurrency
) {
    const pn2 = document.getElementById("pn2");
    const pquan2 = document.getElementById("pquan2");
    const up2 = document.getElementById("up2");
    const sf2 = document.getElementById("sf2");
    const sa2 = document.getElementById("sa2");
    const etp2 = document.getElementById("etp2");
    const currBal2 = document.getElementById("cb2");


    pn2.textContent = productName;
    pquan2.textContent = prodQuantity;
    up2.textContent = `${currencySigns[priceCurrency]}${unitPrice}`;
    sf2.textContent = savingsFreq;
    sa2.textContent = `${currencySigns[savingsCurrency]}${savingsAmount}`;
    currBal2.textContent = `${currencySigns[BalCurrency]}${currentBalance}`;

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

    analIndex = Math.floor(Math.random() * 27);
    analysis = analTexts[analIndex];

    analBox1.textContent = startingDate;
    analBox2.textContent = endingDate;
    analText.innerHTML = analysis;

    const convertionsUnits = [];
    const estimatedTimeNeededLabel = `${timeNeeded} ${etpFreq[savingsFreq]}`;
    for (const [key, value] of Object.entries(etpFreq)) {
        if (value != etpFreq[savingsFreq]) {
            let equivalentVal;
            let equivalent;

            if (value === "day") {
                if (etpFreq[savingsFreq] === "week") {
                    equivalent = Math.trunc(timeNeeded * 7);
                    equivalentVal = `${equivalent} day${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "month") {
                    equivalent = Math.trunc(timeNeeded * 30);
                    equivalentVal = `${equivalent} day${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(timeNeeded * 365);
                    equivalentVal = `${equivalent} day${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }

            else if (value === "week") {
                if (etpFreq[savingsFreq] === "day") {
                    equivalent = Math.trunc(timeNeeded / 7);
                    equivalentVal = `${equivalent} week${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "month") {
                    equivalent = Math.trunc(timeNeeded * 4);
                    equivalentVal = `${equivalent} week${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(timeNeeded * 52);
                    equivalentVal = `${equivalent} week${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }

            else if (value === "month") {
                if (etpFreq[savingsFreq] === "day") {
                    equivalent = Math.trunc(timeNeeded / 30);
                    equivalentVal = `${equivalent} month${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "week") {
                    equivalent = Math.trunc(timeNeeded / 4);
                    equivalentVal = `${equivalent} month${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(timeNeeded * 12);
                    equivalentVal = `${equivalent} month${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }

            else {
                if (etpFreq[savingsFreq] === "day") {
                    equivalent = Math.trunc(timeNeeded / 365);
                    equivalentVal = `${equivalent} year${equivalent !== 1 ? "s" : ""}`;
                }
                else if (etpFreq[savingsFreq] === "week") {
                    equivalent = Math.trunc(timeNeeded / 52);
                    equivalentVal = `${equivalent} year${equivalent !== 1 ? "s" : ""}`;
                }
                else {
                    equivalent = Math.trunc(timeNeeded / 12);
                    equivalentVal = `${equivalent} year${equivalent !== 1 ? "s" : ""}`;
                }

                if (equivalent !== 0) {
                    convertionsUnits.push({
                        estimatedTimeNeeded: estimatedTimeNeededLabel,
                        equivalent: equivalentVal
                    });
                }
            }
        }
    }

    const convertions = `
        <div id="convertionsCon" style="display: none;">
            <div id="cvheader">Time Unit Convertions</div>
            ${convertionsUnits.map(a => `
            <div class="convertion">
                <label>
                    <span class="key">${a.estimatedTimeNeeded}</span>
                    <span class="val">${a.equivalent}</span>
                </label>
            </div>
            <div class="arrow"></div>
            `).join("")}
        </div>
    `;

    const timeHighlightElem = document.querySelector(".timeHiglight");

    timeHighlightElem.insertAdjacentHTML(
        "beforeend",
        convertions
    );
    const convertionsElem = document.getElementById("convertionsCon");

    timeHighlightElem.addEventListener("mouseenter", () => {
        convertionsElem.style.display = 'flex';
    });
    timeHighlightElem.addEventListener("mouseleave", () => {
        convertionsElem.style.display = 'none';
    });

    let highlightTooltipOpen = false;
    timeHighlightElem.addEventListener("click", (e) => {
        e.stopPropagation();
        highlightTooltipOpen = !highlightTooltipOpen;
        convertionsElem.style.display = highlightTooltipOpen ? 'flex' : 'none';
    });
    document.addEventListener("click", () => {
        if (highlightTooltipOpen) {
            highlightTooltipOpen = false;
            convertionsElem.style.display = 'none';
        }
    });
}