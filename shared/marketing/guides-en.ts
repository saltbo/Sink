export const englishGuides = [
  {
    slug: 'shorten-url',
    title: 'How to shorten a URL for free',
    description: 'Turn a long URL into a short link you can share. Learn how to keep tracking parameters, test redirects and choose an expiration date.',
    intro: 'Long URLs can contain folders, search filters and campaign parameters. A short link gives that address a simpler entry point without changing the destination page. Here is how to create one and check it before sharing.',
    example: { before: 'https://example.com/articles/sharing-guide?utm_source=newsletter', after: 'tftt.cc/read', caption: 'Example: share an article in your newsletter with a shorter, readable link.' },
    sections: [
      { title: 'Start with the right destination', paragraphs: ['Open the page you want to share and copy its complete address. Prefer a stable public URL over a temporary download link or a page that only works in your current signed-in session.', 'A short link does not change the destination’s permissions. If the original page requires an account, a subscription or organization access, your visitors will still need that access. Test the original URL in a signed-out window before creating a public link.'] },
      { title: 'Create your link, then open it yourself', paragraphs: ['Sign in to tftt.cc and create a link from the dashboard. Paste the full destination URL. You can keep the generated short code or enter an available custom name. Save the link and copy the resulting tftt.cc address.', 'Open that short address in a fresh browser window. Check the final destination, not just whether a page loads. For registrations, downloads or event pages, also check that the next action works on a phone and without your own account permissions.'] },
      { title: 'Keep useful campaign parameters', paragraphs: ['You can shorten a destination containing UTM parameters. For example, keep utm_source=newsletter on an email campaign link so the destination’s analytics can identify the source. Shortening the URL makes it easier to share; you do not need to remove useful parameters first.', 'Do not include passwords, session tokens or private access credentials in a URL intended for public sharing. A short link is not encryption. Visitors can see the destination address after the redirect.'] },
      { title: 'Choose an expiration that fits the use case', paragraphs: ['An article or portfolio may not need an automatic expiration date. A temporary event may benefit from an expiration aligned with its schedule. Deleted, expired or disabled links will no longer provide a working redirect.', 'Take particular care with printed materials. A link on a poster is harder to replace than a button on a website. Check both the short link and the destination before printing, and keep the entry point available for as long as people may use the material.'] },
    ],
    questions: [
      { question: 'Does shortening a URL compress the web page?', answer: 'No. It shortens the address people share, not the text, images or files on the destination page.' },
      { question: 'Why can I open the destination but my visitors cannot?', answer: 'Check whether the destination requires a login or special permission. A short link cannot bypass those requirements or repair an expired destination URL.' },
    ],
  },
  {
    slug: 'custom-short-links',
    title: 'Custom short links: choose a memorable URL',
    description: 'Create a readable custom short code for your content or campaign. Learn naming rules, channel naming and the difference between a custom path and domain.',
    intro: 'A random short code is useful for a quick share. A custom name is useful when the same link appears in a profile, newsletter or printed campaign. Make it readable, relevant and easy to type.',
    example: { before: 'https://example.com/portfolio/selected-work-and-projects', after: 'tftt.cc/my-work', caption: 'Example: name the link after its content instead of using a random string.' },
    sections: [
      { title: 'Customize the part after the slash', paragraphs: ['In tftt.cc/my-work, tftt.cc is the sharing domain and my-work is the short code. You can choose an available short code when creating a link. This does not connect your own domain to the service.', 'Each short code identifies one link. If a name is already taken, choose another. Names reserved for site features are not available for public links. A short, distinctive alternative is usually more useful than a long variation of a crowded name.'] },
      { title: 'Name the content, not a list of keywords', paragraphs: ['Use short words or numbers such as read, my-work or meetup-2026. Supported names contain letters and numbers, optionally separated by single hyphens. Spaces, Chinese characters and consecutive hyphens are not supported in short codes.', 'Consistent lowercase names are easier to copy and type. Adding many search keywords to a short code does not automatically improve the destination’s search rankings. Choose the name for the person reading it.'] },
      { title: 'Use separate names for separate channels', paragraphs: ['For one event, create meetup-mail for your newsletter and meetup-poster for print. Both can point to the same event page. Separate links make it easier to compare the traffic received by each entry point over the same period.', 'If you also need campaign attribution on the destination website, add appropriate UTM parameters to the destination URL before creating each link. The short code itself does not automatically become a campaign parameter.'] },
      { title: 'Treat a published short code as a stable address', paragraphs: ['Choose the name before printing or widely distributing it. The current editing flow keeps an existing short code; create a new link if you need a different name. Changing a name cannot update materials that have already been shared.', 'After editing a destination, test the redirect again. Browsers can cache earlier redirects, so a previously used device may not immediately follow the new destination. Do not rely on a permanent redirect as an instant switch for every visitor.'] },
    ],
    questions: [
      { question: 'Is a custom short code the same as a custom domain?', answer: 'No. Here you customize the path after tftt.cc. Connecting a domain you own is a separate capability.' },
      { question: 'What if my preferred name is taken?', answer: 'Try adding a relevant topic, format or event year while keeping the result readable. Avoid names that could impersonate another person or organization.' },
    ],
  },
  {
    slug: 'qr-code-links',
    title: 'QR code links for posters, cards and events',
    description: 'Generate a QR code from a short link. Learn how to prepare and test printed materials, and what happens when a destination changes or expires.',
    intro: 'A QR code can carry your short link from a screen to a poster, business card or event stand. Scanning the code opens the short address, which redirects to your destination. Plan for the whole journey, not just the code image.',
    example: { before: 'https://example.com/events/meetup/registration?utm_source=poster', after: 'tftt.cc/meetup', caption: 'Example: encode the short link in a QR code that leads to an event registration page.' },
    sections: [
      { title: 'Create the short link before generating its code', paragraphs: ['Sign in to tftt.cc and create a link to your registration page, portfolio or article. Open the link’s QR code feature in the dashboard, download the code and place it in your design.', 'Use the QR code generated for your actual link. Decorative code graphics in design previews are not functional examples. Before distributing your material, scan the downloaded code and confirm its destination.'] },
      { title: 'Keep the printed code clear', paragraphs: ['Use strong contrast and leave a clear margin around the QR code. Keep text, borders and busy backgrounds away from its edges. Do not stretch or squash the image to make it fit a layout.', 'A usable print size depends on print quality, viewing distance and the scanning device. Print a sample at its final size and test it with different phones from the distance your audience will actually use. A successful scan while zoomed in on a design file is not enough.'] },
      { title: 'Test what happens after the scan', paragraphs: ['Check that the destination works well on a phone, that any required login is appropriate, and that registration or download actions work. For an event, confirm the dates, location and availability of the form.', 'Print the readable short link beside the QR code where possible. It gives people another way to reach the page if scanning is inconvenient. A memorable custom code makes that alternative easier to type.'] },
      { title: 'Understand destination changes and expiration', paragraphs: ['The QR code contains the short address. If you keep that address and edit its destination, the image does not need to be re-encoded. However, a browser may cache an earlier redirect, so previously used devices are not guaranteed to update immediately.', 'Consider both the short link’s expiration and the destination page’s lifetime. Avoid deleting links still printed on long-lived materials. A QR image can remain intact even after the address it contains has stopped working.'] },
    ],
    questions: [
      { question: 'Do QR code visits equal event participants?', answer: 'No. One person may scan several times or open the page without registering. Compare link traffic with registration or conversion records.' },
      { question: 'Can a QR code link work without internet access?', answer: 'The image can appear on offline materials, but opening the online page it points to still needs an internet connection.' },
    ],
  },
  {
    slug: 'link-analytics',
    title: 'Link analytics: understand your short-link clicks',
    description: 'Learn what short-link clicks, referrers and countries tell you. Compare campaigns and understand repeat visits, preview bots and attribution differences.',
    intro: 'Link analytics can show whether a shared address gets opened and which entry points attract attention. Clicks are useful signals, but they are not automatically unique people, sales or completed registrations.',
    example: { before: 'One campaign: newsletter / poster / social post', after: 'Use one short link per channel', caption: 'Comparison example: keep the destination consistent and give each channel its own entry point.' },
    sections: [
      { title: 'Compare the same reporting window', paragraphs: ['Open the analytics for your link in the dashboard and choose a consistent time range. Compare trends over that range rather than comparing a one-day-old link with another that has been shared for a month.', 'Link statistics are recorded when the short-link service receives a request. Repeat visits, link previews and automated requests can affect the numbers. Do not describe every request as a new person.'] },
      { title: 'Treat referrers and countries as context', paragraphs: ['Referrer information can help explain where a visit came from, but browsers and apps do not always send it. An empty referrer does not prove that the visitor typed the address or came from a particular campaign.', 'Country information reflects network-location signals that may be affected by proxies and network routing. Use it to understand broad patterns, not to identify a person or establish an exact physical location.'] },
      { title: 'Separate your campaign entry points', paragraphs: ['Create different short links for email, social posts and posters while keeping the destination consistent. After the campaign has run, compare their traffic over the same reporting period to understand which entry point received more attention.', 'More clicks do not necessarily mean better results. To measure registrations, downloads or purchases, compare traffic with the destination website’s conversion records. UTM parameters can help that website distinguish your campaign channels.'] },
      { title: 'Expect differences from website analytics', paragraphs: ['The two systems measure different parts of the journey. A short-link service records an incoming request; the destination may count only after a page or analytics script loads. Early exits, blocked scripts, preview bots and repeated requests can produce different totals.', 'Cached redirects can also send later visits straight to the destination without contacting the short-link service again. Look at trends and channel differences instead of expecting both systems to report exactly the same number.'] },
    ],
    questions: [
      { question: 'Is the realtime view a second-by-second audit log?', answer: 'No. The dashboard refreshes statistics periodically. Use it to observe recent activity rather than as a zero-delay record of every event.' },
      { question: 'Can link analytics identify a particular visitor?', answer: 'These statistics alone do not establish someone’s identity. Referrers, devices and countries describe traffic patterns, not a verified list of people.' },
    ],
  },
] as const
