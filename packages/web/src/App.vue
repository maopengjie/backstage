<script setup lang="ts">
import { Role } from '@backstage/shared'; //引入自己的共享包
</script>

<template>
  <div style="padding: 20px">
    <h1>你好,Backstage 管理系统</h1>
    <p>当前系统定义的角色有:</p>
    <ul>
      <li v-for="role in Object.values(Role)" :key="role">角色名:{{ role }}</li>
    </ul>
    <div style="margin-top: 20px; color: #666">(这些数据是从 packages/shared 里过来的)</div>
  </div>
</template>
