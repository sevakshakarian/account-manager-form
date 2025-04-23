import { defineStore } from 'pinia'

export interface Account {
    id: string
    labelRaw: string
    label: { text: string }[]
    type: 'LDAP' | 'Локальная'
    login: string
    password: string | null
    errors?: {
        login?: boolean
        password?: boolean
    }
}

function parseLabels(raw: string): { text: string }[] {
    return raw
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .map(label => ({ text: label }))
}

export const useAccountStore = defineStore('account', {
    state: () => ({
        accounts: [] as Account[],
    }),

    actions: {
        addAccount() {
            this.accounts.push({
                id: crypto.randomUUID(),
                labelRaw: '',
                label: [],
                type: 'Локальная',
                login: '',
                password: '',
                errors: {}
            })
        },

        updateField(index: number, field: keyof Account, value: any) {
            const acc = this.accounts[index]
            acc[field] = value
            if (field === 'labelRaw') {
                acc.label = parseLabels(value)
            }
        },

        validate(index: number): boolean {
            const acc = this.accounts[index]
            const errors = {
                login: !acc.login.trim(),
                password: acc.type === 'Локальная' && !acc.password?.trim(),
            }

            acc.errors = errors
            return !Object.values(errors).includes(true)
        },

        deleteAccount(index: number) {
            this.accounts.splice(index, 1)
        },

        saveToLocalStorage() {
            localStorage.setItem('accounts', JSON.stringify(this.accounts))
        },

        loadFromLocalStorage() {
            const data = localStorage.getItem('accounts')
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    this.accounts = parsed.map((acc: Account) => ({
                        ...acc,
                        errors: {},
                        label: parseLabels(acc.labelRaw || '')
                    }))
                } catch {
                    this.accounts = []
                }
            }
        }
    },
})
