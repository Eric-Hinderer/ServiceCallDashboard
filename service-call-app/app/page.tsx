import RealTimeOpenInProgress from "./(Real Time Data)/RealTimeOpen";
import { Typography, Container, Box, Card, CardContent } from "@mui/material";

import Grid from "@mui/material/Grid2";

export default function Home() {
  return (
    <Container
      style={{
        padding: "0.5rem",
        backgroundColor: "#f4f6f9",
        width: "100%",
        maxWidth: "2000px",
      }}
    >
      {/* Current Service Calls */}

      {/* Service Call List (RealTime Component) */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Box>
              <Typography
                variant="h5"
                style={{
                  fontWeight: "500",
                  textAlign: "center",
                  color: "#37474f",
                }}
              >
                Current Service Calls (Open/In Progress)
              </Typography>
            </Box>
            <RealTimeOpenInProgress />
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}
