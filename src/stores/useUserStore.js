import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: 'https://i.pravatar.cc/80?img=3'  // 占位头像
    }
  }),

  actions: {
    setUser(newUser) {
      this.user = newUser
    },

    clearUser() {
      this.user = {
        name: '',
        email: '',
        avatar: ''
      }
    }
  }
})
