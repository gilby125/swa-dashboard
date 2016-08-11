# SWA Scraper
I'm a lazy programmer. ¯\\\_(ツ)\_/¯

## Installation
Since I would rather not get in trouble, you can clone the repo locally and
use `npm link` to use the executable.
```
cd wherever-you-cloned-it-to
npm link
```

## Usage
It will scrape Southwest's prices every `n` minutes (`n` = whatever interval you
define via the `--interval` flag) and compare the results, letting you know the
difference in price since the last interval. The default interval is 30 mins.

You may optionally set a `--deal-price-threshold` flag, which will alert you if
the prices fall below the threshold you define. Other than `--interval`, all
other flags are required. _I'm lazy, so there is no validation._

```bash
swa \
  --from 'DAL' \
  --to 'LGA' \
  --leave-date '11/01/2016' \
  --return-date '11/08/2016' \
  --passengers 2 \
  --deal-price-threshold 50 \ # In dollars (optional)
  --interval 5 # In minutes (optional)
```

### Twilio integration
If you have a Twilio account and you've set up a deal price threshold, you can
set the following environment vars to set up SMS deal alerts. _Just be warned:
as long as the deal threshold is hit, you're going to get SMS messages at the
rate of the interval you defined. So wake up and book those tickets!_

```bash
export TWILIO_ACCOUNT_SID=""
export TWILIO_AUTH_TOKEN=""
export TWILIO_PHONE_FROM=""
export TWILIO_PHONE_TO=""
```
