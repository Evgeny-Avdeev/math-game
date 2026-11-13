// Copy this file and provide a real engine before adding the definition to activityDefinitions.
import {mountActivityTemplate} from '../activity-template.mjs?v=arithmetic-template-1';

export function defineNewActivity(engine){
 return {
  id:'replace-with-unique-id',
  title:'Название нового занятия',
  symbol:'✦',
  instruction:'Коротко объясни, что нажать или ввести.',
  rules:['Первое правило.','Второе правило.'],
  buddyText:'Разберёмся вместе! Если трудно, позови меня.',
  mount(root,services){
   return mountActivityTemplate(root,{...services,engine});
  },
 };
}
