#!/usr/bin/env node
"use strict"

const osmosis = require("osmosis")
const chalk = require("chalk")
const rainbow = require("chalk-rainbow")
const twilio = require("twilio");

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
var dealPriceThreshold
var interval = 30 // In minutes

// Parse command line options (no validation, sorry!)
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
    case "--deal-price-threshold":
      dealPriceThreshold = parseInt(argv[i + 1])
      break
    case "--interval":
      interval = parseInt(argv[i + 1])
      break
  }
})

// Check if Twilio env vars are set
const isTwilioConfigured = process.env.TWILIO_ACCOUNT_SID &&
                           process.env.TWILIO_AUTH_TOKEN &&
                           process.env.TWILIO_PHONE_FROM &&
                           process.env.TWILIO_PHONE_TO

/**
 * Send a text message using Twilio
 *
 * @param {Str} message
 *
 * @return {Void}
 */
const sendTextMessage = (message) => {
  try {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    twilioClient.sendMessage({
      from: process.env.TWILIO_PHONE_FROM,
      to: process.env.TWILIO_PHONE_TO,
      body: message
    }, function(err, data) {
      if (err) {
        console.log(
          chalk.red(`Error: failed to send SMS to ${process.env.TWILIO_PHONE_TO} from ${process.env.TWILIO_PHONE_FROM}`)
        )
      } else {
        console.log(
          chalk.green(`Successfully sent SMS to ${process.env.TWILIO_PHONE_TO} from ${process.env.TWILIO_PHONE_FROM}`)
        )
      }
    })
  } catch(e) {}
}

/**
 * Fetch latest Southwest prices
 *
 * @return {Void}
 */
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
      seniorPassengerCount: 0,
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

      // Clear previous fares
      fares.outbound = []
      fares.return = []

      // Get difference from previous fares
      const outboundFareDiff = prevLowestOutboundFare - lowestOutboundFare
      const returnFareDiff = prevLowestReturnFare - lowestReturnFare
      var outboundFareDiffString = ""
      var returnFareDiffString = ""

      if (!isNaN(outboundFareDiff) && !isNaN(returnFareDiff)) {

        if (outboundFareDiff > 0) {
          outboundFareDiffString = chalk.red(`(up \$${Math.abs(outboundFareDiff)})`)
        } else if (outboundFareDiff < 0) {
          outboundFareDiffString = chalk.green(`(down \$${Math.abs(outboundFareDiff)})`)
        } else if (outboundFareDiff === 0) {
          outboundFareDiffString = chalk.blue(`(no change)`)
        }

        if (returnFareDiff > 0) {
          returnFareDiffString = chalk.red(`(up \$${Math.abs(returnFareDiff)})`)
        } else if (returnFareDiff < 0) {
          returnFareDiffString = chalk.green(`(down \$${Math.abs(returnFareDiff)})`)
        } else if (returnFareDiff === 0) {
          returnFareDiffString = chalk.blue(`(no change)`)
        }
      }

      // Store current fares for next time
      prevLowestOutboundFare = lowestOutboundFare
      prevLowestReturnFare = lowestReturnFare

      // Do some Twilio magic (SMS alerts for awesome deals)
      if (dealPriceThreshold && (lowestOutboundFare <= dealPriceThreshold || lowestReturnFare <= dealPriceThreshold)) {
        const message = `Deal alert! Lowest fair has hit \$${lowestOutboundFare} (outbound) and \$${lowestReturnFare} (return).`

        // Party time
        console.log(rainbow(`\n${message}`))

        if (isTwilioConfigured) {
          sendTextMessage(message)
        }
      }

      console.log(
        `\nLowest fair for an outbound flight is currently \$${[lowestOutboundFare, outboundFareDiffString].filter(i => i).join(" ")},\nwhile the cheapest return flight is \$${[lowestReturnFare, returnFareDiffString].filter(i => i).join(" ")}.`
      )

      setTimeout(fetch, interval * TIME_MIN)
    })
}

console.log(chalk.green("Starting…"))

if (dealPriceThreshold) {
  console.log(chalk.yellow(`Watching for deals lower than \$${dealPriceThreshold}!`))

  if (isTwilioConfigured) {
    console.log(chalk.yellow(`SMS deal alerts are enabled for ${process.env.TWILIO_PHONE_TO}!`))
  }
}

fetch()
