#!/usr/bin/env node
"use strict"

const osmosis = require("osmosis")
const chalk = require("chalk")

// Time constants
const TIME_MS = 1
const TIME_SEC = TIME_MS * 1000
const TIME_MIN = TIME_SEC * 60
const TIME_HOUR = TIME_MIN * 60

// Fares
var prevLowestOutboundFare
var prevLowestReturnFare
const fares = {
  outbound: [],
  return: []
}

// Command line options
var originAirport
var destinationAirport
var outboundDateString
var returnDateString
var adultPassengerCount
var interval = 30 // In minutes

process.argv.forEach((arg, i, argv) => {
  switch (arg) {
    case "--from":
      originAirport = argv[i + 1]
      break
    case "--to":
      destinationAirport = argv[i + 1]
      break
    case "--leave-date":
      outboundDateString = argv[i + 1]
      break
    case "--return-date":
      returnDateString = argv[i + 1]
      break
    case "--passengers":
      adultPassengerCount = argv[i + 1]
      break
    case "--interval":
      interval = argv[i + 1]
      break
  }
})

const fetch = () => {
  osmosis
    .get("https://www.southwest.com")
    .submit(".booking-form--form", {
      twoWayTrip: true,
      originAirport: originAirport,
      destinationAirport: destinationAirport,
      airTranRedirect: "",
      returnAirport: "RoundTrip",
      outboundDateString: outboundDateString,
      outboundTimeOfDay: "ANYTIME",
      returnDateString: returnDateString,
      returnTimeOfDay: "ANYTIME",
      adultPassengerCount: adultPassengerCount,
      seniorPassengerCount: "0",
      fareType: "DOLLARS",
    })
    .find("#faresOutbound .product_price")
    .then((priceMarkup) => {
      let matches = priceMarkup.toString().match(/\$.*?(\d+)/)
      let price = parseInt(matches[1])
      fares.outbound.push(price)
    })
    .find("#faresReturn .product_price")
    .then((priceMarkup) => {
      let matches = priceMarkup.toString().match(/\$.*?(\d+)/)
      let price = parseInt(matches[1])
      fares.return.push(price)
    })
    .done(() => {
      const lowestOutboundFare = Math.min(...fares.outbound)
      const lowestReturnFare = Math.min(...fares.return)

      // Get difference from previous fares
      const outboundFareDiff = prevLowestOutboundFare - lowestOutboundFare
      const returnFareDiff = prevLowestReturnFare - lowestReturnFare
      var outboundFareDiffString = ""
      var returnFareDiffString = ""

      if (outboundFareDiff !== NaN && returnFareDiff !== NaN) {
        switch (true) {
          case outboundFareDiff > 0:
            outboundFareDiffString = chalk.red(`(up \$${outboundFareDiff})`)
          case outboundFareDiff < 0:
            outboundFareDiffString = chalk.green(`(down \$${outboundFareDiff})`)
          case outboundFareDiff === 0:
            outboundFareDiffString = chalk.blue(`(no change)`)
          case returnFareDiff > 0:
            returnFareDiffString = chalk.red(`(up \$${returnFareDiff})`)
          case returnFareDiff < 0:
            returnFareDiffString = chalk.green(`(down \$${returnFareDiff})`)
          case returnFareDiff === 0:
            returnFareDiffString = chalk.blue(`(no change)`)
        }
      }

      // Store current fares
      prevLowestOutboundFare = lowestOutboundFare
      prevLowestReturnFare = lowestReturnFare

      console.log(`
        Lowest fair for outbound flight is currently \$${[lowestOutboundFare, outboundFareDiffString].filter(i => i).join(" ")},
        while the cheapest return flight is \$${[lowestReturnFare, returnFareDiffString].filter(i => i).join(" ")}.`
      )

      setTimeout(fetch, interval * TIME_MIN)
    })
}

console.log(chalk.green("Starting…"))
fetch()
