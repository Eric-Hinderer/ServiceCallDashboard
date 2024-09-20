"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ChatProps {
  children: React.ReactNode;
}

export default function ChatWithDatabase({ children }: ChatProps) {
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! How can I help you today?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    setLoading(true);

    try {
      const response = await fetch("/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const { summary } = await response.json();

      const modelMessage = { role: "model", text: summary };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Something went wrong, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position="relative" minHeight="100vh">
      {/* Main content */}
      {children}

      {/* Open chat button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1300,
          padding: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          "@media (max-width:600px)": {
            bottom: 16,
            right: 16,
          }, // Adjust button position on small screens
        }}
      >
        Open Chat
      </Button>

      {/* Chat overlay dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            position: "fixed",
            bottom: 0,
            right: 0,
            height: "80vh",
            width: "420px",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease-out",
            margin: "10px",
          },
        }}
        sx={{
          "@media (max-width:600px)": {
            "& .MuiDialog-paper": {
              width: "100%",
              height: "90vh",
              borderRadius: 0,
            },
          },
          "@media (min-width:600px)": {
            "& .MuiDialog-paper": {
              width: "420px",
            },
          },
        }}
        TransitionProps={{
          timeout: 500,
        }}
      >
        <DialogActions>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "grey.600",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>

        <DialogContent dividers>
          <Box
            ref={chatContainerRef}
            flexGrow={1}
            overflow="auto"
            p={2}
            component={Paper}
            elevation={0}
            height="65vh"
            sx={{
              borderRadius: 2,
              padding: "16px",
              overflowY: "auto",
              "@media (max-width:600px)": {
                height: "60vh", 
              },
            }}
          >
            <Box
              maxWidth="sm"
              mx="auto"
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    msg.role === "user" ? "flex-end" : "flex-start"
                  }
                >
                  <Box
                    p={2}
                    borderRadius={2}
                    maxWidth="80%"
                    component={Paper}
                    elevation={3}
                    bgcolor={msg.role === "user" ? "primary.main" : "grey.100"}
                    color={
                      msg.role === "user"
                        ? "primary.contrastText"
                        : "text.primary"
                    }
                    sx={{
                      borderBottomRightRadius: msg.role === "user" ? 0 : 2,
                      borderBottomLeftRadius: msg.role === "assistant" ? 0 : 2,
                      wordWrap: "break-word",
                      boxShadow: "0px 2px 4px",
                    }}
                  >
                    {msg.text}
                  </Box>
                </Box>
              ))}

              {loading && (
                <Box display="flex" justifyContent="flex-start">
                  <Box
                    p={2}
                    borderRadius={2}
                    maxWidth="80%"
                    component={Paper}
                    elevation={3}
                    bgcolor="grey.200"
                  >
                    <CircularProgress size={20} />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
            sx={{ mr: 2, borderRadius: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUserInput}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
