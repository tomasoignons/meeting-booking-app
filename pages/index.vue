<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-4xl font-bold text-gray-800 text-center">
          📅 Meeting Booking
        </h1>
        <p class="text-gray-600 text-center mt-2">
          Select a time slot to book your appointment
        </p>
      </div>
    </div>

    <!-- Calendar Container -->
    <div class="container mx-auto px-6 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-6">
          <vue-cal
            :events="events"
            :disable-views="['years', 'year', 'month']"
            default-view="week"
            :disable-event-details="true"
            @cell-click="handleCellClick"
            class="custom-calendar"
          />
        </div>
      </div>
    </div>

    <!-- Booking Popup -->
    <transition
      name="modal"
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showPopup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black opacity-50"
          @click="cancelPopup"
        ></div>
        
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md popup-container">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
            <h2 class="text-2xl font-bold flex items-center">
              🗓️ Book Your Meeting
            </h2>
            <p class="text-blue-100 mt-1">Confirm your appointment details</p>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto popup-content">
            <div class="space-y-4">
              <!-- Date Display -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  📅 Date
                </label>
                <input
                  type="date"
                  v-model="selectedDateInput"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Time Display -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  🕐 Time
                </label>
                <input
                  type="time"
                  v-model="selectedTime"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Duration Selection -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ⏱️ Duration
                </label>
                <select
                  v-model="meetingDuration"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <!-- Contact Information -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  📧 Your Email
                </label>
                <input
                  v-model="userEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  👤 Your Name
                </label>
                <input
                  v-model="userName"
                  type="text"
                  placeholder="Your full name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Meeting Type Selection -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  📍 Meeting Type
                </label>
                <div class="flex items-center space-x-4 mb-4">
                  <span class="text-sm text-gray-600" :class="meetingType === 'presential' ? 'font-medium text-blue-600' : ''">🏢 In Person</span>
                  <div class="relative">
                    <div
                      @click="toggleMeetingType"
                      class="w-12 h-6 rounded-full shadow-inner cursor-pointer transition-all duration-300"
                      :class="meetingType === 'virtual' ? 'bg-blue-500' : 'bg-gray-300'"
                    >
                      <div
                        class="w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 mt-0.5"
                        :class="meetingType === 'virtual' ? 'translate-x-6' : 'translate-x-0.5'"
                      ></div>
                    </div>
                  </div>
                  <span class="text-sm text-gray-600" :class="meetingType === 'virtual' ? 'font-medium text-blue-600' : ''">💻 Virtual</span>
                </div>

                <!-- In Person Location -->
                <div v-if="meetingType === 'presential'" class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Location/Room
                  </label>
                  <input
                    v-model="meetingLocation"
                    type="text"
                    placeholder="Enter meeting location or room number..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <!-- Virtual Meeting Options -->
                <div v-if="meetingType === 'virtual'" class="mt-4">
                  <div class="flex items-center space-x-4 mb-4">
                    <span class="text-sm text-gray-600" :class="virtualMeetingType === 'conference' ? 'font-medium text-blue-600' : ''">🏠 My Room</span>
                    <div class="relative">
                      <div
                        @click="toggleVirtualMeetingType"
                        class="w-12 h-6 rounded-full shadow-inner cursor-pointer transition-all duration-300"
                        :class="virtualMeetingType === 'custom' ? 'bg-blue-500' : 'bg-gray-300'"
                      >
                        <div
                          class="w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 mt-0.5"
                          :class="virtualMeetingType === 'custom' ? 'translate-x-6' : 'translate-x-0.5'"
                        ></div>
                      </div>
                    </div>
                    <span class="text-sm text-gray-600" :class="virtualMeetingType === 'custom' ? 'font-medium text-blue-600' : ''">🔗 Custom Link</span>
                  </div>

                  <!-- Custom Meeting Link -->
                  <div v-if="virtualMeetingType === 'custom'" class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      🔗 Meeting Link
                    </label>
                    <input
                      v-model="customMeetingLink"
                      type="url"
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <!-- Conference Room Info -->
                  <div v-if="virtualMeetingType === 'conference'" class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-center">
                      <span class="text-blue-600 mr-2">ℹ️</span>
                      <span class="text-sm text-blue-800">Meeting will be held in my conference room. Link will be provided after booking.</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Meeting Notes -->
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  📝 Meeting Notes (Optional)
                </label>
                <textarea
                  v-model="meetingNotes"
                  placeholder="Brief description of what you'd like to discuss..."
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
            <button
              @click="cancelPopup"
              class="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="confirmMeeting"
              :disabled="!isFormValid"
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
            >
              <span v-if="!isSubmitting">📅 Confirm Booking</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Booking...
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
const toast = useToast();

export default {
  components: {
    VueCal,
  },
  data() {
    return {
      events: [],
      showPopup: false,
      selectedDate: null,
      selectedTime: null,
      meetingDuration: 30,
      userEmail: '',
      userName: '',
      meetingNotes: '',
      meetingType: 'presential', // 'presential' or 'virtual'
      meetingLocation: '',
      virtualMeetingType: 'conference', // 'conference' or 'custom'
      customMeetingLink: '',
      isSubmitting: false,
    };
  },
  computed: {
    isFormValid() {
      console.log("le formulaire est valide")
      const basicValidation = this.userEmail && this.userName && this.userEmail.includes('@') && this.selectedDateInput && this.selectedTime;
      
      if (!basicValidation) return false;
      
      // Additional validation based on meeting type
      if (this.meetingType === 'presential') {
        return this.meetingLocation && this.meetingLocation.trim() !== '';
      } else if (this.meetingType === 'virtual' && this.virtualMeetingType === 'custom') {
        return this.customMeetingLink && this.customMeetingLink.trim() !== '';
      }
      
      return true;
    },
    selectedDateInput: {
      get() {
        if (!this.selectedDate) return '';
        const dateObj = this.selectedDate instanceof Date ? this.selectedDate : new Date(this.selectedDate);
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      },
      set(value) {
        if (value) {
          this.selectedDate = new Date(value);
        }
      }
    }
  },
  watch: {
    // Watch for popup visibility changes to control body scroll
    showPopup(newValue) {
      // Remove scroll control - allow natural scrolling
      // The popup container now handles overflow properly
    }
  },
  methods: {
    async fetchEvents() {
      try {
        const response = await fetch('/api/google-calendar-obligatoire-events');
        const data = await response.json();
        this.events = data.map(event => ({
          start: new Date(event.start),
          end: new Date(event.end),
          class: 'unavailable-event',
        }));
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    },
    handleCellClick(eventData) {
		
		// Vue-cal passes the clicked date/time as a single Date object
		let clickedDate;
		let clickedTime;
		
		if (eventData instanceof Date) {
			// Extract both date and time from the Date object
			clickedDate = new Date(eventData);
			
			// Round to nearest 15 minutes
			const minutes = eventData.getMinutes();
			const roundedMinutes = Math.round(minutes / 15) * 15;
			
			// Handle minute overflow (e.g., 60 minutes becomes next hour)
			const adjustedDate = new Date(eventData);
			adjustedDate.setMinutes(roundedMinutes);
			
			// Extract time in HH:MM format after rounding
			const hours = adjustedDate.getHours().toString().padStart(2, '0');
			const finalMinutes = adjustedDate.getMinutes().toString().padStart(2, '0');
			clickedTime = `${hours}:${finalMinutes}`;
		} else if (typeof eventData === 'string') {
			clickedDate = new Date(eventData);
			
			// Round to nearest 15 minutes
			const minutes = clickedDate.getMinutes();
			const roundedMinutes = Math.round(minutes / 15) * 15;
			
			clickedDate.setMinutes(roundedMinutes);
			
			const hours = clickedDate.getHours().toString().padStart(2, '0');
			const finalMinutes = clickedDate.getMinutes().toString().padStart(2, '0');
			clickedTime = `${hours}:${finalMinutes}`;
		} else {
			// Fallback
			clickedDate = new Date();
			clickedTime = '09:00';
		}
		
		// Set the date (reset time to start of day for consistent date handling)
		this.selectedDate = new Date(
			clickedDate.getFullYear(),
			clickedDate.getMonth(),
			clickedDate.getDate()
		);	

		const y = this.selectedDate.getFullYear();
		const m = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
		const d = String(this.selectedDate.getDate()).padStart(2, '0');
		this.selectedDateInput = `${y}-${m}-${d}`;
		
		// Set the time from the clicked cell
		this.selectedTime = clickedTime;
		
		this.showPopup = true;
		},
    toggleMeetingType() {
      this.meetingType = this.meetingType === 'presential' ? 'virtual' : 'presential';
      // Reset location/link fields when switching types
      this.meetingLocation = '';
      this.customMeetingLink = '';
    },
    toggleVirtualMeetingType() {
      this.virtualMeetingType = this.virtualMeetingType === 'conference' ? 'custom' : 'conference';
      // Reset custom link when switching back to conference
      if (this.virtualMeetingType === 'conference') {
        this.customMeetingLink = '';
      }
    },
    checkForConflicts() {
	console.log('Checking for conflicts...');
      if (!this.selectedDate || !this.selectedTime) {
        return false;
      }

      try {
        // Create meeting start time
        const [hours, minutes] = this.selectedTime.split(':');
        const meetingStart = new Date(this.selectedDate);
        meetingStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Create meeting end time based on duration
        const meetingEnd = new Date(meetingStart);
        meetingEnd.setMinutes(meetingEnd.getMinutes() + parseInt(this.meetingDuration));

        console.log('Checking conflicts for:', {
          start: meetingStart,
          end: meetingEnd,
          duration: this.meetingDuration
        });

        // Check against existing events
        for (const event of this.events) {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);

          // Check if meetings overlap
          const hasConflict = (
            (meetingStart >= eventStart && meetingStart < eventEnd) ||
            (meetingEnd > eventStart && meetingEnd <= eventEnd) ||
            (meetingStart <= eventStart && meetingEnd >= eventEnd)
          );

          if (hasConflict) {
            console.log('Conflict found with event:', event);
            return {
              hasConflict: true,
              conflictingEvent: event,
              meetingStart,
              meetingEnd
            };
          }
        }

        return { hasConflict: false, meetingStart, meetingEnd };
      } catch (error) {
        console.error('Error checking conflicts:', error);
        return { hasConflict: false };
      }
    },
    async confirmMeeting() {
      if (!this.isFormValid) return;
      
      this.isSubmitting = true;
      const conflicts = this.checkForConflicts();
	  if (conflicts.hasConflict) {
		  toast.error({title : "Conflict !", message:`Conflict detected with existing an event I already have`});
		  this.isSubmitting = false;
		  return;
	  }
      try {
        

		// Create the meeting in the backend
		const meetingData = {
		  date: this.selectedDateInput,
		  time: this.selectedTime,
		  duration: this.meetingDuration,
		  userEmail: this.userEmail,
		  userName: this.userName,
		  notes: this.meetingNotes,
		  type: this.meetingType,
		  location: this.meetingLocation,
		  virtualType: this.virtualMeetingType,
		  customLink: this.customMeetingLink
		};
		
		await this.createMeeting(meetingData);

        this.showPopup = false;
        this.resetForm();
		if (toast) {
			toast.success({title : "Success !", message:`Your meeting has been booked successfully`});
		} else {
			const toastElement = useToast();
			toastElement.success({title : "Success !", message:`Your meeting has been booked successfully`});
		}
		
      } catch (error) {
        console.error('Error booking meeting:', error);
        // TODO: Show error notification
      } finally {
        this.isSubmitting = false;
      }
    },
    async createMeeting(meetingData) {
      try {
		console.log(meetingData)
        const response = await fetch('/api/create-meeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create meeting');
        }

        const result = await response.json();
        console.log('Meeting created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error creating meeting:', error);
		toast.error({title : "Error !", message:`Failed to create meeting, please try again later`});
        throw error;
      }
    },
    cancelPopup() {
      this.showPopup = false;
      this.resetForm();
    },
    resetForm() {
      this.userEmail = '';
      this.userName = '';
      this.meetingNotes = '';
      this.meetingDuration = 30;
      this.meetingType = 'presential';
      this.meetingLocation = '';
      this.virtualMeetingType = 'conference';
      this.customMeetingLink = '';
      this.selectedDate = null;
      this.selectedTime = null;
    },
    formatDate(date) {
      if (!date) return 'Select a date';
      
      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid date';
        
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    },
    formatTime(time) {
      if (!time) return 'Select a time';
      
      try {
        // Handle time in HH:MM format
        if (typeof time === 'string' && time.includes(':')) {
          const [hours, minutes] = time.split(':');
          const timeObj = new Date();
          timeObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          return timeObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        }
        
        // Fallback for other time formats
        const timeObj = new Date(`2000-01-01T${time}`);
        if (isNaN(timeObj.getTime())) return 'Invalid time';
        
        return timeObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid time';
      }
    },
    // Methods to control body scrolling (now unused but kept for reference)
    disableBodyScroll() {
      // Disabled - allowing natural scroll behavior
    },
    enableBodyScroll() {
      // Disabled - allowing natural scroll behavior
    },
  },
  mounted() {
    this.fetchEvents();
  },
  beforeUnmount() {
    // Ensure body scroll is enabled when component is destroyed
    this.enableBodyScroll();
  },
};
</script>

<style>
/* Custom Calendar Styling */
.custom-calendar {
  border-radius: 8px;
  overflow: hidden;
}

.unavailable-event {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  opacity: 0.8 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Vue Cal custom styles */
.vuecal__cell {
  border-color: #e5e7eb !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.vuecal__cell:hover {
  background-color: #f3f4f6 !important;
}

.vuecal__title {
  color: #374151 !important;
  font-weight: 600 !important;
}

.vuecal__header {
  background-color: #f9fafb !important;
  border-bottom: 2px solid #e5e7eb !important;
}

/* Popup container styling for 80% height and centering */
.popup-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.popup-content::-webkit-scrollbar {
  width: 6px;
}

.popup-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.popup-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.popup-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation classes */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from, .notification-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Ensure modal stays above everything */
.fixed.inset-0.z-50 {
  z-index: 9999;
}
</style>