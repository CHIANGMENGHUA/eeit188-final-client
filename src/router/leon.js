const router = {
  path: "/leon",
  name: "leon",
  children: [
    {
      path: "signup",
      name: "signup",
      component: () => import("@/components/user/Signup.vue"),
    },
    {
      path: "login",
      name: "login",
      component: () => import("@/components/user/Login.vue"),
    },
    {
      path: "userCollection",
      name: "userCollection",
      component: () => import("@/components/user/UserCollection.vue"),
    },
    {
      path: "coupon",
      name: "coupon",
      component: () => import("@/components/user/Coupon.vue"),
    },
    {
      path: "discuss",
      name: "discuss",
      component: () => import("@/components/user/Discuss.vue"),
    },
    {
      path: "userDetail",
      name: "userDetail",
      component: () => import("@/components/user/UserDetail.vue"),
    },
  ],
};

export default router;
