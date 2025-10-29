import { defineStore } from "pinia";


import { apiCreateEmergency,apiDeleteEmergency,apiGetEmergency,apiGetEmergencyall,apiUpdateEmergency } from "@/services/apiEmergency";

export   const useEmergencyStore = defineStore('emergency',{
state: ()=>({
  emergencys:[],
  emergency:null,
}),
actions:{
      async allEmergency(){
        this.emergencys= await apiGetEmergencyall()
      },
      async oneEmergency(id){
        this.emergency=await apiGetEmergency(id)
      },
      async updateEmergency(id,data){
        await apiUpdateEmergency(id,data)
        this.allEmergency()
        this.oneEmergency()
      },
      async deleteEmergency(id){
        await apiDeleteEmergency(id)
        this.allEmergency()
        this.oneEmergency()
      },
      async createEmergency(data){
        await apiCreateEmergency(data)
        this.allEmergency()
        this.oneEmergency()
      }
},


})
