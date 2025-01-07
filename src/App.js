// App.js
import React from "react";
import LessonBuilder from "./pages/LessonBuilder";  // Updated import
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LessonBuilder />  {/* Updated component name */}
    </ThemeProvider>
  );
}

export default App;