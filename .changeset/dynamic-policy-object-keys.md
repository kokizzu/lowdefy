---
'@lowdefy/api': patch
'@lowdefy/docs': patch
---

fix(api): Dynamic blocks policies check object keys and slot names the same way as values

A block can draw an object key as well as a value: the keys of a `Descriptions` `items` object are its labels, and `Tabs` and `Collapse` draw slot names as titles. A dynamic blocks policy now applies the `html` rule and its URL checks to every object key and every slot or area name in the content, as it does to a string no block schema marks. Keys in data, such as a `SetState` value under the policy's `state` path, are not checked, since data is never drawn.
