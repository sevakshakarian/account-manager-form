<template>
  <section class="container bg-white text-gray-900 p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <h1 class="text-xl sm:text-2xl font-semibold text-red-500">Учетные записи</h1>
      <button
          @click="addAccount"
          class="border border-gray-300 hover:bg-gray-100 transition px-4 py-2 rounded text-lg sm:text-xl"
      >
        +
      </button>
    </div>

    <div class="flex items-start gap-2 text-sm bg-gray-100 border border-gray-200 rounded p-3">
      <p>Для указания нескольких меток для одной пары логин/пароль используйте разделитель</p>
    </div>

    <div class="space-y-2">
      <div
          v-for="(account, index) in accounts"
          :key="account.id"
          class="grid grid-cols-1 sm:grid-cols-[20rem_8rem_1fr_16rem_2.5rem] gap-3 items-center border border-gray-200 rounded px-4 py-3"
      >
        <input
            v-model="account.labelRaw"
            @blur="validate(index)"
            placeholder="Метки"
            class="px-3 py-2 border border-gray-300 rounded w-full"
        />

        <select
            v-model="account.type"
            @change="validate(index)"
            class="appearance-none px-3 py-2 border border-gray-300 rounded w-full bg-white text-gray-900"
        >
          <option value="Локальная">Локальная</option>
          <option value="LDAP">LDAP</option>
        </select>

        <input
            v-model="account.login"
            @blur="validate(index)"
              placeholder="Логин"
              :class="[
        'px-3 py-2 border rounded w-full ',
        account.errors?.login ? 'border-red-500' : 'border-gray-300'
          ]"
        />

        <div v-if="account.type === 'Локальная'" class="relative w-full">
          <input
              :type="showPassword[account.id] ? 'text' : 'password'"
              v-model="account.password"
              @blur="validate(index)"
              placeholder="Password"
              :class="[
              'px-3 py-2 border rounded w-full',
              account.errors?.password ? 'border-red-500' : 'border-gray-300'
            ]"
          />

          <button
              type="button"
              class="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
              @click="togglePassword(account.id)"
          >
            <component :is="showPassword[account.id] ? EyeSlashIcon : EyeIcon" class="w-5 h-5" />
          </button>
        </div>

        <button
            @click="deleteAccount(index)"
            class="text-gray-500 hover:text-red-500 flex items-center justify-center"
        >
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, watch } from 'vue'
import { useAccountStore } from '../stores/accountStore'
import {
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const store = useAccountStore()
const accounts = computed(() => store.accounts)

const showPassword = reactive<Record<string, boolean>>({})

const addAccount = () => {
  store.addAccount()
  const id = store.accounts[store.accounts.length - 1].id
  showPassword[id] = false
}

const deleteAccount = (index: number) => {
  const id = store.accounts[index].id
  delete showPassword[id]
  store.deleteAccount(index)
}

const validate = (index: number) => {
  if (store.validate(index)) {
    store.saveToLocalStorage()
  }
}

const togglePassword = (id: string) => {
  showPassword[id] = !showPassword[id]
}

onMounted(() => {
  store.loadFromLocalStorage()
  store.accounts.forEach(acc => {
    showPassword[acc.id] = false
  })
})

watch(() => store.accounts, () => {
  store.saveToLocalStorage()
}, { deep: true })
</script>
