# SWA Dashboard
Dashboard to monitor and receive alerts for changes in Southwest fare prices.

![image](https://cloud.githubusercontent.com/assets/6979737/17740385/08603f62-645e-11e6-9abf-df4851a95f29.png)

## Why?
I'm a lazy programmer who was tired of checking flight prices … and I really wanted
to try out Twilio and [blessed](https://github.com/chjj/blessed/). ¯\\\_(ツ)\_/¯

## Installation
Since I would rather not get in trouble for publishing this tool to npm, you can
clone the repo locally and use `npm link` to use the executable.
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
other flags are required. _Currently, there is no validation._

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
If you have a Twilio account (I'm using a free trial account) and you've set up
a deal price threshold, you can set the following environment vars to set up SMS
deal alerts. _Just be warned: as long as the deal threshold is met, you're going
to receive SMS messages at the rate of the interval you defined. Better wake up
and book those tickets!_

```bash
export TWILIO_ACCOUNT_SID=""
export TWILIO_AUTH_TOKEN=""
export TWILIO_PHONE_FROM=""
export TWILIO_PHONE_TO=""
```
