
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RealTimeOpenInProgress from "./(Real Time Data)/RealTimeOpen";
import { Typography, Container, Box } from "@mui/material";



export default function Home() {
  return (
    <Container maxWidth="xl" style={{ paddingTop: "5.5rem" }}>
    {/* Welcome Section */}
    <Box textAlign="center" marginBottom="2rem">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Service Call Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        Here you can track and manage ongoing service calls. Check below for
        service calls that are currently in progress or open.
      </Typography>
    </Box>

    {/* Service Calls Table */}
    <RealTimeOpenInProgress />
  </Container>
  );

}


