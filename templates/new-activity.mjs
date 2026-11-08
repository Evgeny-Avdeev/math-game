// Copy this adapter for a real activity. Import your engine and call from app.mjs.
// This file is deliberately not registered or imported by the production app.
import {mountActivityTemplate} from '../activity-template.mjs?v=3';

export function mountNewActivity(root,services,engine){
 const definition={
  id:'replace-with-unique-id',
  title:'Название нового занятия',
  eyebrow:'КОРОТКАЯ ПОДПИСЬ',
  instruction:'Коротко объясни, что нажать или ввести.',
  rules:['Первое правило.','Второе правило.'],
  rulesNote:'Подсказками пользоваться можно!',
  buddyText:'Разберёмся вместе! Если трудно, позови меня.',
 };
 return mountActivityTemplate(root,{...services,definition,engine});
}
