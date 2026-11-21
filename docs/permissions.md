# Privacy practices — textos para la revisión de la tienda

Van en inglés porque es lo que lee el revisor. Pestaña "Privacy practices"
del panel de la Chrome Web Store.

## Single purpose

This extension has a single purpose: to show currency exchange rates for
Argentina on the browser toolbar and let the user convert amounts between
Argentine pesos and those currencies.

## alarms

The rates are refreshed every 10 minutes in the background so the toolbar
badge always shows a current value. `chrome.alarms` is the only way to
schedule that work from a service worker, and showing an up-to-date rate is
the extension's core function.

## storage

Stores two things, both local to the browser: the user's own settings (which
rate to show on the badge, buy or sell, badge colour, theme, alert value) and
a cache of the last rates fetched, so the popup opens instantly and still
shows the last known value when the network is down. No personal data is
stored and nothing is sent to any server of ours — we have no server.

## notifications

Used only for the optional price alert the user sets up themselves: the user
types a value, and when the selling price of the chosen rate crosses it, a
notification fires once. The feature is off by default and the notification
only ever contains the rate and the price.

## contextMenus

Adds two optional right-click items that convert a number the user has
selected on a page (pesos to dollars and the reverse). The selected text
reaches the extension through the `selectionText` field of the context-menu
click event, which is why the extension needs **no** `scripting`,
`activeTab` or page host permissions: it never injects code into any page and
cannot read anything the user did not deliberately select and right-click.
The selection is used in memory to compute the result and is never stored or
transmitted.

## Host permission — https://dolarapi.com/*

The source of the exchange rates. Read-only GET requests to public
endpoints. The requests carry no information about the user.

## Host permission — https://api.argentinadatos.com/*

The source of the daily closing history, used to show how much each rate
moved today and a 30-day sparkline. Read-only GET requests to public
endpoints, cached for 6 hours.

## Remote code

No. The extension executes no remote code. All JavaScript is bundled in the
package; the only network traffic is reading JSON from the two APIs above.

## Data usage

Nothing is collected. Tick no categories, and certify:

- We do not sell or transfer user data to third parties.
- We do not use or transfer user data for purposes unrelated to the
  extension's single purpose.
- We do not use or transfer user data to determine creditworthiness or for
  lending purposes.
