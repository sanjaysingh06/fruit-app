import {
  Box,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

export default function TransactionItems({ form, setForm }) {
  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          item_name: "",
          quantity: "",
          weight: "",
          rate: "",
          amount: 0,
          calculation_type: "WEIGHT",
        },
      ],
    });
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;

    const item = updated[index];

    if (item.calculation_type === "WEIGHT") {
      item.amount = (item.weight || 0) * (item.rate || 0);
    } else if (item.calculation_type === "QUANTITY") {
      item.amount = (item.quantity || 0) * (item.rate || 0);
    } else {
      item.amount = item.rate || 0;
    }

    setForm({ ...form, items: updated });
  };

  const removeItem = (index) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  return (
    <Box mt={3}>
      {form.items.map((item, i) => (
        <Paper key={i} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <TextField
                label="Item"
                fullWidth
                value={item.item_name}
                onChange={(e) =>
                  updateItem(i, "item_name", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                select
                fullWidth
                value={item.calculation_type}
                onChange={(e) =>
                  updateItem(i, "calculation_type", e.target.value)
                }
              >
                <MenuItem value="WEIGHT">Weight</MenuItem>
                <MenuItem value="QUANTITY">Quantity</MenuItem>
                <MenuItem value="DIRECT">Direct</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="Weight"
                fullWidth
                value={item.weight}
                onChange={(e) =>
                  updateItem(i, "weight", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="Qty"
                fullWidth
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                label="Rate"
                fullWidth
                value={item.rate}
                onChange={(e) =>
                  updateItem(i, "rate", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={1}>
              <TextField value={item.amount} disabled fullWidth />
            </Grid>

            <Grid item xs={1}>
              <IconButton onClick={() => removeItem(i)}>
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button startIcon={<Add />} onClick={addItem}>
        Add Item
      </Button>
    </Box>
  );
}