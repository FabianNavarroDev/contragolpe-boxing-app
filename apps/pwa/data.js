/* Contragolpe Boxing — datos semilla de demostración.
   En producción estos datos vienen del backend (Firebase / API). */
(function (global) {
  'use strict';

  const DAY = 86400000;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function iso(d) { return new Date(d).toISOString(); }
  function uid(p) { return (p || 'id') + '_' + Math.random().toString(36).slice(2, 9); }

  const PLANS = [
    { id: 'visita', name: 'Visita', price: 120, days: 1 },
    { id: 'mensual', name: 'Mensual', price: 900, days: 30 },
    { id: 'trimestral', name: 'Trimestral', price: 2400, days: 90 },
    { id: 'anual', name: 'Anual', price: 8500, days: 365 },
    { id: 'infantil', name: 'Infantil', price: 750, days: 30 }
  ];

  const CATEGORIES = [
    [52, 'Mosca'], [57, 'Pluma'], [61, 'Ligero'], [64, 'Superligero'],
    [69, 'Wélter'], [75, 'Mediano'], [81, 'Semicompleto'], [91, 'Crucero'], [999, 'Completo']
  ];
  function categoryFor(kg) { for (const [max, n] of CATEGORIES) if (kg <= max) return n; return 'Completo'; }

  const RAW = [
    // nombre, alias, edad, nac, peso, años exp, guardia, alcance, altura, plan, compromiso(0-1)
    ['Diego Ramírez', 'El Zurdo', 27, 'México', 70.4, 4, 'Zurda', 182, 176, 'trimestral', 0.85],
    ['Valeria Ochoa', 'La Fiera', 24, 'México', 57.2, 3, 'Ortodoxa', 164, 162, 'anual', 0.9],
    ['Luis Méndez', 'Lucky', 31, 'México', 78.9, 6, 'Ortodoxa', 186, 180, 'anual', 0.75],
    ['Andrea Cárdenas', 'Dinamita', 22, 'México', 54.8, 1, 'Ortodoxa', 160, 158, 'mensual', 0.7],
    ['Jorge Villalobos', 'El Toro', 35, 'México', 92.5, 8, 'Ortodoxa', 190, 184, 'anual', 0.6],
    ['Sofía Herrera', 'Relámpago', 26, 'México', 60.1, 2, 'Zurda', 166, 165, 'mensual', 0.8],
    ['Emiliano Torres', 'Mili', 19, 'México', 63.7, 1, 'Ortodoxa', 175, 172, 'mensual', 0.5],
    ['Carlos Guzmán', 'Cobra', 29, 'Colombia', 67.5, 5, 'Ortodoxa', 178, 174, 'trimestral', 0.65],
    ['Mariana López', 'Mari', 28, 'México', 62.3, 2, 'Ortodoxa', 168, 166, 'mensual', 0.35],
    ['Ricardo Salas', 'Tanque', 40, 'México', 88.0, 3, 'Ortodoxa', 184, 178, 'mensual', 0.2],
    ['Fernanda Ruiz', 'Fer', 23, 'México', 58.6, 1, 'Zurda', 163, 161, 'mensual', 0.55],
    ['Iván Castañeda', 'Gallo', 33, 'México', 72.2, 7, 'Ortodoxa', 181, 177, 'anual', 0.7],
    ['Paola Medina', 'Pao', 30, 'Argentina', 65.0, 2, 'Ortodoxa', 170, 168, 'trimestral', 0.45],
    ['Héctor Navarro', 'Martillo', 37, 'México', 84.4, 9, 'Ortodoxa', 188, 181, 'anual', 0.5],
    ['Ximena Ortega', 'Xime', 21, 'México', 53.9, 1, 'Ortodoxa', 158, 157, 'mensual', 0.6],
    ['Bruno Aguilar', 'Bala', 25, 'México', 66.1, 3, 'Zurda', 177, 175, 'mensual', 0.15],
    ['Daniela Fuentes', 'Dani', 27, 'México', 61.4, 2, 'Ortodoxa', 167, 165, 'trimestral', 0.65],
    ['Óscar Rentería', 'Pantera', 32, 'México', 76.3, 5, 'Ortodoxa', 183, 179, 'mensual', 0.3],
    ['Renata Ibarra', 'Reni', 34, 'España', 59.8, 1, 'Ortodoxa', 165, 164, 'mensual', 0.4],
    ['Mateo Zúñiga', 'Mate', 12, 'México', 41.0, 1, 'Ortodoxa', 140, 145, 'infantil', 0.6],
    ['Gael Espinoza', 'Gaelito', 11, 'México', 38.5, 1, 'Zurda', 136, 141, 'infantil', 0.5],
    ['Natalia Pérez', 'Nati', 29, 'México', 63.0, 4, 'Ortodoxa', 169, 167, 'anual', 0.8],
    ['Alejandro Vega', 'Alex', 26, 'México', 74.8, 2, 'Ortodoxa', 180, 178, 'mensual', 0.25],
    ['Camila Rosas', 'Cami', 20, 'México', 56.0, 1, 'Ortodoxa', 161, 160, 'mensual', 0.55]
  ];

  function buildSeed() {
    const rnd = mulberry32(20261119);
    const today = startOfDay(Date.now());
    const members = [];
    const checkins = [];
    const payments = [];

    RAW.forEach((r, i) => {
      const [name, alias, age, nat, weight, exp, guard, reach, height, plan, eng] = r;
      const id = 'm' + (i + 1);
      const planObj = PLANS.find(p => p.id === plan);
      const sinceDays = Math.round(exp * 120 + rnd() * 200);
      const since = new Date(today.getTime() - sinceDays * DAY);
      // vencimiento: repartidos para que existan activos, por vencer y vencidos
      let expOffset;
      if (eng < 0.3) expOffset = -Math.round(3 + rnd() * 20);
      else if (i % 6 === 2) expOffset = Math.round(1 + rnd() * 5);
      else expOffset = Math.round(8 + rnd() * planObj.days * 0.8);
      if (i === 0) expOffset = 41;
      const expires = new Date(today.getTime() + expOffset * DAY);

      const attendance = [];
      let lastGap = 0;
      for (let d = 70; d >= 1; d--) {
        const date = new Date(today.getTime() - d * DAY);
        if (date.getDay() === 0) continue; // domingo cerrado
        let p = eng * 0.85;
        if (eng < 0.3 && d < 18) p = 0.02; // dejan de venir
        if (rnd() < p) {
          const hourPool = [6, 7, 7, 8, 9, 18, 19, 19, 20, 20, 21];
          const h = hourPool[Math.floor(rnd() * hourPool.length)];
          const ts = new Date(date); ts.setHours(h, Math.floor(rnd() * 50), 0, 0);
          attendance.push(iso(ts));
          checkins.push({ id: uid('c'), memberId: id, ts: iso(ts) });
        }
      }
      // check-ins de hoy para que el panel no esté vacío (excepto el usuario demo)
      if (i !== 0 && eng > 0.6 && rnd() < 0.6) {
        const ts = new Date(today); ts.setHours(6 + Math.floor(rnd() * 4), Math.floor(rnd() * 59));
        if (ts.getTime() < Date.now()) {
          attendance.push(iso(ts));
          checkins.push({ id: uid('c'), memberId: id, ts: iso(ts) });
        }
      }

      // racha
      let streak = 0;
      const days = new Set(attendance.map(a => startOfDay(a).getTime()));
      let cursor = today.getTime() - DAY;
      let misses = 0;
      while (cursor > today.getTime() - 70 * DAY) {
        const dd = new Date(cursor);
        if (dd.getDay() !== 0) {
          if (days.has(cursor)) { streak++; misses = 0; }
          else { misses++; if (misses > 1) break; }
        }
        cursor -= DAY;
      }

      const total = attendance.length + Math.round(exp * 60 * eng);
      const weightLog = [];
      for (let k = 5; k >= 0; k--) {
        const m = new Date(today); m.setMonth(m.getMonth() - k); m.setDate(1);
        weightLog.push({ d: iso(m), kg: Math.round((weight + k * (0.4 + rnd() * 0.5) * (weight > 70 ? 1 : 0.5)) * 10) / 10 });
      }

      members.push({
        id, name, alias, age, nat, weight, cat: categoryFor(weight), expYears: exp, guard, reach, height,
        plan, since: iso(since), expires: iso(expires), phone: '33 ' + (1000 + Math.floor(rnd() * 8999)) + ' ' + (1000 + Math.floor(rnd() * 8999)),
        xp: Math.round(total * 50 + rnd() * 400), coins: Math.round(200 + rnd() * 1400),
        streak, attendance, totalSessions: total,
        rounds: Math.round(total * (4 + rnd() * 4)),
        spar: { w: Math.round(exp * 3 * eng + rnd() * 3), l: Math.round(exp * 1.5 + rnd() * 2), d: Math.round(rnd() * 4) },
        weightLog, photo: null, videos: [], notes: ''
      });

      // pagos: último pago y uno anterior
      const p1 = new Date(expires.getTime() - planObj.days * DAY);
      if (p1 < today) payments.push({ id: uid('p'), memberId: id, amount: planObj.price, plan, ts: iso(p1), method: rnd() < 0.5 ? 'Tarjeta' : 'Efectivo' });
      const p0 = new Date(p1.getTime() - planObj.days * DAY);
      if (p0 > since) payments.push({ id: uid('p'), memberId: id, amount: planObj.price, plan, ts: iso(p0), method: rnd() < 0.5 ? 'Transferencia' : 'Efectivo' });
    });

    // pagos extra de visitas sueltas para ingresos diarios
    for (let d = 60; d >= 0; d--) {
      const date = new Date(today.getTime() - d * DAY);
      if (date.getDay() === 0) continue;
      const n = Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const ts = new Date(date); ts.setHours(7 + Math.floor(rnd() * 13));
        if (ts.getTime() < Date.now()) payments.push({ id: uid('p'), memberId: null, amount: 120, plan: 'visita', ts: iso(ts), method: 'Efectivo' });
      }
    }

    const classes = [];
    const schedule = [
      ['Box técnico', 'Coach Beto', '07:00', 60, 16, 'Todos'],
      ['Acondicionamiento', 'Coach Karla', '08:15', 45, 20, 'Todos'],
      ['Box infantil', 'Coach Beto', '17:00', 60, 12, 'Niños 8–14'],
      ['Box técnico', 'Coach Memo', '19:00', 60, 18, 'Todos'],
      ['Sparring controlado', 'Coach Memo', '20:15', 60, 10, 'Intermedio+'],
      ['Box femenil', 'Coach Karla', '18:00', 60, 14, 'Todos']
    ];
    for (let day = 1; day <= 6; day++) {
      schedule.forEach((s, j) => {
        if (day === 6 && j > 1) return; // sábado solo mañana
        if (s[0] === 'Sparring controlado' && !(day === 2 || day === 4)) return;
        if (s[0] === 'Box femenil' && !(day === 1 || day === 3 || day === 5)) return;
        const booked = [];
        const fill = Math.floor(s[4] * (0.35 + rnd() * 0.6));
        for (let b = 0; b < fill; b++) booked.push('m' + (2 + Math.floor(rnd() * 22)));
        classes.push({ id: uid('k'), name: s[0], coach: s[1], day, time: s[2], dur: s[3], cap: s[4], level: s[5], booked: Array.from(new Set(booked)), wait: [] });
      });
    }
    // el usuario demo reservado en una clase de mañana
    const tomorrow = (today.getDay() + 1) % 7 || 1;
    const myClass = classes.find(c => c.day === tomorrow && c.time === '19:00');
    if (myClass && !myClass.booked.includes('m1')) myClass.booked.push('m1');

    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59);
    const challenges = [
      { id: 'ch1', title: '20 entrenamientos en el mes', metric: 'monthAttendance', goal: 20, reward: 400, ends: iso(monthEnd), desc: 'Cumple 20 asistencias antes de fin de mes.' },
      { id: 'ch2', title: 'Racha de 10 días', metric: 'streak', goal: 10, reward: 300, ends: iso(monthEnd), desc: 'Entrena 10 días seguidos (domingo no cuenta).' },
      { id: 'ch3', title: '150 rounds acumulados', metric: 'monthRounds', goal: 150, reward: 350, ends: iso(monthEnd), desc: 'Saco, manoplas o sombra: cada round cuenta.' },
      { id: 'ch4', title: 'Madrugador', metric: 'early', goal: 8, reward: 250, ends: iso(monthEnd), desc: '8 check-ins antes de las 8:00 am.' }
    ];

    const duels = [
      { id: 'd1', a: 'm1', b: 'm8', metric: 'monthAttendance', label: 'Asistencias del mes', ends: iso(monthEnd), stake: 200, status: 'activo' },
      { id: 'd2', a: 'm1', b: 'm12', metric: 'monthRounds', label: 'Rounds del mes', ends: iso(monthEnd), stake: 150, status: 'activo' }
    ];

    const rewards = [
      { id: 'r1', name: 'Agua natural 1 L', cost: 150, stock: 48, icon: 'water', tag: 'Hidratación' },
      { id: 'r2', name: 'Electrolitos', cost: 300, stock: 30, icon: 'bolt', tag: 'Hidratación' },
      { id: 'r3', name: 'Vendas Contragolpe', cost: 650, stock: 20, icon: 'wrap', tag: 'Equipo' },
      { id: 'r4', name: 'Playera oficial', cost: 1500, stock: 15, icon: 'shirt', tag: 'Merch' },
      { id: 'r5', name: 'Clase privada 1:1', cost: 2200, stock: 6, icon: 'glove', tag: 'Experiencia' },
      { id: 'r6', name: 'Guantes 14 oz', cost: 5200, stock: 4, icon: 'glove', tag: 'Equipo' },
      { id: 'r7', name: 'Una semana gratis a un amigo', cost: 900, stock: 99, icon: 'ticket', tag: 'Referidos' },
      { id: 'r8', name: 'Gorra Contragolpe', cost: 1100, stock: 12, icon: 'cap', tag: 'Merch' }
    ];

    const redemptions = [
      { id: uid('x'), memberId: 'm2', rewardId: 'r2', ts: iso(today.getTime() - 3600000 * 3), code: 'CG-4821', status: 'pendiente' },
      { id: uid('x'), memberId: 'm3', rewardId: 'r1', ts: iso(today.getTime() - 3600000 * 20), code: 'CG-1975', status: 'pendiente' },
      { id: uid('x'), memberId: 'm1', rewardId: 'r1', ts: iso(today.getTime() - DAY * 6), code: 'CG-3310', status: 'entregado' }
    ];

    const notices = [
      { id: uid('n'), title: 'Velada interna — sábado 29', body: 'Inscríbete con tu coach para los sparrings de exhibición. Habrá electrolitos para todos los participantes.', ts: iso(today.getTime() - DAY), tag: 'Evento' },
      { id: uid('n'), title: 'Horario de diciembre', body: 'Del 24 al 1 de enero abrimos solo de 7:00 a 11:00.', ts: iso(today.getTime() - DAY * 4), tag: 'Horario' }
    ];

    return {
      version: 3,
      me: 'm1',
      role: 'socio',
      gym: { name: 'Contragolpe Boxing', handle: '@contra_golpeboxingdl', city: 'Guadalajara, Jal.', open: '06:00', close: '22:00', checkinDelay: 4 },
      plans: PLANS, members, checkins, payments, classes, challenges, duels, rewards, redemptions, notices,
      readNotices: [],
      kioskSeed: Math.floor(rnd() * 1e6)
    };
  }

  global.CG_DATA = { buildSeed, categoryFor, PLANS, DAY, startOfDay, uid, mulberry32 };
})(window);
