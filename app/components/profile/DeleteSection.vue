<template>
  <div class="danger-zone">
    <h3>Danger Zone</h3>
    <p class="warning-text">
      Deleting your account is permanent. All your activities, records, and
      custom records will be lost forever.
    </p>

    <button class="delete-btn" @click="showConfirmDialog = true">
      <v-icon icon="mdi-account-remove-outline" size="18" />
      Delete my account
    </button>

    <v-dialog v-model="showConfirmDialog" max-width="420">
      <v-card>
        <v-card-title>Delete your account permanently?</v-card-title>
        <v-card-text>
          <p>
            This will permanently delete your account, all your activity data,
            personal records, and custom records.
            <strong>This cannot be undone.</strong>
          </p>

          <label class="confirm-input-label">
            Type <strong>DELETE</strong> to confirm
            <input
              v-model="confirmText"
              type="text"
              class="confirm-input"
              placeholder="DELETE"
            />
          </label>

          <p v-if="error" class="error-text">{{ error }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="error"
            :disabled="confirmText !== 'DELETE' || loading"
            @click="performDelete"
          >
            {{ loading ? "Deleting..." : "Delete permanently" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const showConfirmDialog = ref(false);
const confirmText = ref("");
const loading = ref(false);
const error = ref("");

const { clear } = useUserSession();

function closeDialog() {
  showConfirmDialog.value = false;
  confirmText.value = "";
  error.value = "";
}

async function performDelete() {
  if (confirmText.value !== "DELETE") return;

  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/profile/delete-account", { method: "DELETE" });
    await clear(); // pulisce anche lo stato di sessione lato client
    await navigateTo("/");
  } catch (err: any) {
    error.value =
      err?.data?.message || "Something went wrong while deleting your account";
    loading.value = false;
  }
}
</script>

<style scoped>
.danger-zone {
  background: var(--surface);
  border: 1px solid #ef4444;
  border-radius: 14px;
  padding: 24px;
  margin-top: 20px;
}
.danger-zone h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #ef4444;
}
.warning-text {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 16px;
  line-height: 1.5;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.confirm-input-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 16px;
}
.confirm-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.error-text {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
}
</style>
