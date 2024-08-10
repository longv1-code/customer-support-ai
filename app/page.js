'use client'
import { Box, Stack, TextField, IconButton } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useState, useEffect } from 'react'
import styled from '@emotion/styled'


const BubbleBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(to bottom right, #4a90e2, #63b3ed);
`;

const BubbleElement = styled.div`
  position: absolute;
  background: rgba(299, 299, 299, 0.2);
  border-radius: 50%;
  animation: float 4s ease-in-out infinite, moveHorizontal 15s linear infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes moveHorizontal {
    0% { left: -5%; }
    100% { left: 105%; }
  }
`;

function Bubbles() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const newBubbles = [];
    for (let i = 0; i < 20; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * 60 + 20,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 4 + 2}s`,
        moveHorizontalDuration: `${Math.random() * 20 + 10}s`
      });
    }
    setBubbles(newBubbles);
  }, []);

  return (
    <BubbleBackground>
      {bubbles.map((bubble) => (
        <BubbleElement
          key={bubble.id}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            top: bubble.top,
            animationDuration: `${bubble.animationDuration}, ${bubble.moveHorizontalDuration}`
          }}
        />
      ))}
    </BubbleBackground>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm the Headstarter Support Agent, how can I assist you today?`
  }])

  const [message, setMessage] = useState('')
  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ])
    const response = fetch('./api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

return (
  <>
    <Bubbles />
    <Box
      width="100vw"
      height="98vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="650px"
        height="700px"
        border="3px solid lightblue"
        p={2}
        spacing={2}
        bgcolor="rgba(255, 255, 255, 0.1)"
        borderRadius={4}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="calc(100% - 70px)" // Adjust for the input field height
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? 'flex-start' : 'flex-end'
              }
            >
              <Box bgcolor={
                message.role === 'assistant' ? 'primary.main' : 'secondary.main'
              }
                color="white"
                borderRadius={16}
                p={3}
                sx={{
                  transition: 'background-color 0.3s ease',
                  boxShadow: 3,
                  '&:hover': {
                    backgroundColor: message.role === 'assistant' ? 'primary.dark' : 'secondary.dark',
                    boxShadow: 6,
                  }
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Box position="relative">
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                paddingRight: '48px', // Make room for the send button
              },
            }}
          />
          <IconButton 
            onClick={sendMessage}
            sx={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
          </IconButton>
        </Box>
      </Stack>
    </Box>
  </>
)
}