{\rtf1\ansi\ansicpg936\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Roman;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import express from 'express';\
import fetch from 'node-fetch';\
\
const app = express();\
app.use(express.json());\
\
// \uc0\u20320 \u30340 \u21407 \u22987 \u25968 \u25454 \u28304 \u22320 \u22336 \
const FEED_X_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json';\
const FEED_PODCASTS_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json';\
\
app.post('/', async (req, res) => \{\
  // \uc0\u28385 \u36275  Poe \u26426 \u22120 \u20154 \u30340 \u36890 \u20449 \u21327 \u35758  (Server-Sent Events)\
  res.writeHead(200, \{\
    'Content-Type': 'text/event-stream',\
    'Cache-Control': 'no-cache',\
    'Connection': 'keep-alive'\
  \});\
\
  try \{\
    // 1. \uc0\u25235 \u21462 \u26368 \u26032 \u25968 \u25454 \
    const [feedXRes, feedPodRes] = await Promise.all([\
      fetch(FEED_X_URL),\
      fetch(FEED_PODCASTS_URL)\
    ]);\
    \
    const feedX = await feedXRes.json();\
    const feedPod = await feedPodRes.json();\
\
    // 2. \uc0\u23558 \u25968 \u25454 \u32452 \u35013 \u25104 \u35753  AI \u23481 \u26131 \u30475 \u25026 \u30340 \u26684 \u24335 \
    let promptText = "\uc0\u35831 \u24110 \u25105 \u24635 \u32467 \u20170 \u22825 \u30340 \u31185 \u25216 \u22280 \u21160 \u24577 \u65292 \u29983 \u25104 \u19968 \u20221 \u20013 \u25991 \u30340  Daily Digest\u65288 \u27599 \u26085 \u25688 \u35201 \u65289 \u12290 \\n\\n";\
    \
    promptText += "\uc0\u12304 \u20170 \u26085 \u25512 \u25991 \u26356 \u26032 \u12305 \\n";\
    if (feedX.x && feedX.x.length > 0) \{\
      feedX.x.forEach(user => \{\
        promptText += `- $\{user.name\} (@$\{user.handle\}) \uc0\u21457 \u20102  $\{user.tweets.length\} \u26465 \u25512 \u25991 \u12290 \\n`;\
        user.tweets.forEach(t => \{\
          promptText += `  \uc0\u20869 \u23481 : $\{t.text\}\\n`;\
        \});\
      \});\
    \} else \{\
      promptText += "\uc0\u20170 \u26085 \u26080 \u25512 \u25991 \u26356 \u26032 \u12290 \\n";\
    \}\
\
    promptText += "\\n\uc0\u12304 \u20170 \u26085 \u25773 \u23458 \u26356 \u26032 \u12305 \\n";\
    if (feedPod.podcasts && feedPod.podcasts.length > 0) \{\
      feedPod.podcasts.forEach(pod => \{\
        promptText += `- \uc0\u25773 \u23458 \u21517 : $\{pod.name\}\\n  \u26631 \u39064 : $\{pod.title\}\\n  \u38142 \u25509 : $\{pod.url\}\\n`;\
        // \uc0\u20026 \u20102 \u36991 \u20813 \u36229 \u20986 \u23383 \u25968 \u38480 \u21046 \u65292 \u21482 \u25130 \u21462 \u23383 \u24149 \u30340 \u21069  3000 \u20010 \u23383 \u31526 \u35753  AI \u24635 \u32467 \u26680 \u24515 \u20869 \u23481 \
        const shortTranscript = pod.transcript ? pod.transcript.substring(0, 3000) + "..." : "\uc0\u26080 \u23383 \u24149 ";\
        promptText += `  \uc0\u37096 \u20998 \u23383 \u24149 \u20869 \u23481 : $\{shortTranscript\}\\n`;\
      \});\
    \} else \{\
      promptText += "\uc0\u20170 \u26085 \u26080 \u25773 \u23458 \u26356 \u26032 \u12290 \\n";\
    \}\
\
    promptText += "\\n\uc0\u35831 \u26681 \u25454 \u20197 \u19978 \u20869 \u23481 \u65292 \u20889 \u19968 \u31687 \u25490 \u29256 \u31934 \u32654 \u12289 \u37325 \u28857 \u31361 \u20986 \u30340 \u20013 \u25991 \u24635 \u32467 \u12290 ";\
\
    // 3. \uc0\u23558 \u32452 \u35013 \u22909 \u30340 \u25552 \u31034 \u35789 \u21457 \u36865 \u32473  Poe\
    // \uc0\u27880 \u24847 \u65306 \u36825 \u37324 \u25105 \u20204 \u30452 \u25509 \u25226 \u32452 \u35013 \u22909 \u30340 \u25968 \u25454 \u21457 \u32473 \u29992 \u25143 \u65292 \u29992 \u25143 \u22312  Poe \u20013 \u20351 \u29992 \u26102 \u65292 Poe \u30340  AI \u20250 \u30475 \u21040 \u36825 \u20123 \u25991 \u23383 \u24182 \u36827 \u34892 \u24635 \u32467 \
    res.write(`event: text\\ndata: $\{JSON.stringify(\{ text: promptText \})\}\\n\\n`);\
\
  \} catch (error) \{\
    res.write(`event: text\\ndata: $\{JSON.stringify(\{ text: "\uc0\u25235 \u21462 \u25968 \u25454 \u26102 \u21457 \u29983 \u38169 \u35823 : " + error.message \})\}\\n\\n`);\
  \}\
\
  // \uc0\u32467 \u26463 \u21709 \u24212 \
  res.write(`event: done\\ndata: \{\}\\n\\n`);\
  res.end();\
\});\
\
// \uc0\u21551 \u21160 \u26381 \u21153 \u22120 \u65292 \u30417 \u21548  3000 \u31471 \u21475 \u65288 \u20113 \u24179 \u21488 \u20250 \u33258 \u21160 \u20998 \u37197 \u31471 \u21475 \u65289 \
const PORT = process.env.PORT || 3000;\
app.listen(PORT, () => \{\
  console.log(`Poe Server is running on port $\{PORT\}`);\
\});}