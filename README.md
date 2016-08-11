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
define via the `--interval` param) and compare the results, letting you know the
difference in price since the last interval. The default interval is 30 mins.

```bash
swa \
  --from 'DAL' \
  --to 'LGA' \
  --leave-date '11/01/2016' \
  --return-date '11/08/2016' \
  --passengers 2 \
  --deal-price-threshold 50 # In dollars
  --interval 5 # In minutes
```

### Twilio integration
If you have a Twilio account set up, you can set the following environment vars
to set up SMS deal alerts, which using a deal price threshold.

```bash
export TWILIO_ACCOUNT_SID=""
export TWILIO_AUTH_TOKEN=""
export TWILIO_PHONE_FROM=""
export TWILIO_PHONE_TO=""
```
