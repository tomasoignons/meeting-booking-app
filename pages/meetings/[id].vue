<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold text-gray-800 text-center">
          ✏️ Edit Meeting
        </h1>
        <p class="text-gray-600 text-center mt-2">
          Update or delete your meeting below
        </p>
      </div>
    </div>

    <div class="container mx-auto px-6 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto">
        <div class="p-6">
          <form @submit.prevent="updateMeeting">
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">📅 Date</label>
                <input type="date" v-model="meeting.date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">🕐 Time</label>
                <input type="time" v-model="meeting.time" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">⏱️ Duration</label>
                <select v-model="meeting.duration_minutes" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <!-- <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">🏢 Location/Room</label>
                <input v-model="meeting.location" type="text" placeholder="Enter meeting location or room number..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div> -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">📝 Notes</label>
                <textarea v-model="meeting.notes" placeholder="Update your notes..." rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
              </div>
            </div>
            <div class="flex justify-between mt-6">
              <button type="button" @click="deleteMeeting" class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">Delete</button>
              <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <transition name="notification" enter-active-class="duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <div v-if="showSuccess" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
        <span class="text-xl mr-2">✅</span>
        <div>
          <p class="font-medium">Meeting updated!</p>
        </div>
      </div>
    </transition>
    <transition name="notification" enter-active-class="duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <div v-if="showDelete" class="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
        <span class="text-xl mr-2">🗑️</span>
        <div>
          <p class="font-medium">Meeting deleted!</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const meeting = ref({
  date: '',
  time: '',
  duration_minutes: 30,
  location: '',
  notes: '',
});
const isSubmitting = ref(false);
const showSuccess = ref(false);
const showDelete = ref(false);

onMounted(async () => {
  // Fetch meeting details from your API
  const res = await fetch(`/api/get-meeting?id=${id}`);
  if (res.ok) {
    const data = await res.json();
	console.log(data);
    // Parse start_time and end_time to date and time fields
    const start = new Date(data.start_time);
    meeting.value.date = start.toISOString().split('T')[0];
    meeting.value.time = start.toTimeString().slice(0,5);
    meeting.value.duration_minutes = data.duration_minutes;
    // meeting.value.location = data.location || '';
    meeting.value.notes = data.notes || '';
  }
});

async function updateMeeting() {
  isSubmitting.value = true;
  try {
    const res = await fetch(`/api/update-meeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        date: meeting.value.date,
        time: meeting.value.time,
        duration_minutes: meeting.value.duration_minutes,
        location: meeting.value.location,
        notes: meeting.value.notes,
      })
    });
    if (!res.ok) throw new Error('Failed to update meeting');
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, 3000);
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteMeeting() {
  if (!confirm('Are you sure you want to delete this meeting?')) return;
  isSubmitting.value = true;
  try {
    const res = await fetch(`/api/delete-meeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Failed to delete meeting');
    showDelete.value = true;
    setTimeout(() => {
      showDelete.value = false;
      router.push('/');
    }, 2000);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from, .notification-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
