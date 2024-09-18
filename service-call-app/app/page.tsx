import RealTimeOpenInProgress from "./(Real Time Data)/RealTimeOpen";
import { Typography, Container, Box, Card, CardContent } from "@mui/material";

import Grid from "@mui/material/Grid2";

export default function Home() {
  return (
    <Container
      style={{
        padding: "2rem",
        backgroundColor: "#f4f6f9",
        width: "100%",
        maxWidth: "2000px",
      }}
    >
      {/* Dashboard Header */}
      <Box textAlign="center" marginBottom="2rem">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ fontWeight: "600", color: "#333" }}
        >
          Service Call Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Overview of ongoing and completed service calls
        </Typography>
      </Box>

      {/* Current Service Calls */}
      <Box marginBottom="2rem">
        <Typography
          variant="h5"
          gutterBottom
          style={{ fontWeight: "500", textAlign: "center", color: "#37474f" }}
        >
          Current Service Calls (Open/In Progress)
        </Typography>
      </Box>

      {/* Service Call List (RealTime Component) */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <RealTimeOpenInProgress />
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}
