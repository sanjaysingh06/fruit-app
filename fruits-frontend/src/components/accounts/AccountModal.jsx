import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import {
  createAccount,
  updateAccount,
} from "../../api/accountApi";

export default function AccountModal({
  open,
  handleClose,
  refresh,
  editData,
}) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    opening_balance: 0,
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          name: editData.name || "",
          role: editData.role || "",
          opening_balance: editData.opening_balance || 0,
          phone: editData.phone || "",
          address: editData.address || "",
        });
      } else {
        resetForm();
      }
    }
  }, [open, editData]);

  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      opening_balance: 0,
      phone: "",
      address: "",
    });
  };

  const validate = () => {
    if (!form.name) return "Account name is required";
    if (!form.role) return "Role is required";
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validate();

    if (errorMsg) {
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        opening_balance: Number(form.opening_balance),
      };

      if (editData) {
        await updateAccount(editData.id, payload);

        setSnackbar({
          open: true,
          message: "Account updated successfully",
          severity: "success",
        });
      } else {
        await createAccount(payload);

        setSnackbar({
          open: true,
          message: "Account created successfully",
          severity: "success",
        });
      }

      refresh();
      handleClose();
      resetForm();
    } catch (error) {
      console.log(error.response?.data);

      setSnackbar({
        open: true,
        message: "Error saving account",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {editData ? "Edit Account" : "Add Account"}
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Account Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          {/* ✅ ROLE DROPDOWN */}
          <TextField
            select
            label="Account Role"
            fullWidth
            margin="dense"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <MenuItem value="">Select Role</MenuItem>
            <MenuItem value="CUSTOMER">Customer</MenuItem>
            <MenuItem value="VENDOR">Vendor</MenuItem>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="BANK">Bank</MenuItem>
            <MenuItem value="SALES">Sales</MenuItem>
            <MenuItem value="PURCHASE">Purchase</MenuItem>
          </TextField>

          <TextField
            label="Opening Balance"
            type="number"
            fullWidth
            margin="dense"
            value={form.opening_balance}
            onChange={(e) =>
              setForm({ ...form, opening_balance: e.target.value })
            }
          />

          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <TextField
            label="Address"
            fullWidth
            margin="dense"
            multiline
            rows={2}
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({ ...snackbar, open: false })
        }
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}