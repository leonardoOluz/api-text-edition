/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
import request from 'supertest';
import {
  afterAll, beforeAll, describe, expect, it,
} from '@jest/globals';
import { conexaoOn, disconnectionOff } from '../../../mongoose-setup.js';
import app from '../../app.js';

let server;
let auth;

beforeAll(async () => {
  await conexaoOn();
  const port = 3000;
  server = app.listen(port);
});

afterAll(async () => {
  await disconnectionOff();
  await server.close();
});

const postagemMock = {
  id_usuario: '667354473deeb5146cb21655',
  titulo: 'Testando rotas de postagem',
  descricao: 'Esse é um teste de rotas de postagem',
  linguagem: 'php',
  codigo: '?php/> function app(a, b){ return a + b <php>',
  cor: '#f2f2f2',
};

describe('Testes em Rotas de Postagem', () => {
  describe('Create em Postagem', () => {
    it('Recebendo Token para testes', async () => {
      const response = await request(server)
        .post('/user/login')
        .send({ email: process.env.EMAIL, senha: process.env.SENHA })
        .expect(200);
      auth = await response.body.message;
      expect(response.body.message).toHaveLength(211);
    });
    it('Teste de postagem criada com sucesso !', async () => {
      await request(server)
        .post('/postagem')
        .send(postagemMock)
        .set('Authorization', `bearer ${auth}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ message: 'dados criado com sucesso!' });
    });
  });
  describe('GET em PostagemRoutes', () => {
    it('retorna uma lista de postagem como um array de objetos quando chamada com GET ', async () => {
      const res = await request(server)
        .get('/postagens')
        .auth(auth, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /json/);
      if (Array.isArray(res.body)) {
        expect(res.body).toEqual(expect.arrayContaining(
          [{
            _id: expect.any(String),
            id_usuario: expect.any(String),
            titulo: expect.any(String),
            descricao: expect.any(String),
            linguagem: expect.any(String),
            codigo: expect.any(String),
            cor: expect.any(String),
            curtidas_id_usuario: expect.any(Array),
            mensagem: expect.any(Array),
          }],
        ));
      } else {
        expect(res.body).toBeNull();
      }
    });
    it('acessar Postagem por titulo', async () => {
      const response = await request(server)
        .get(`/postagem/busca?titulo=${postagemMock.titulo}`)
        .auth(auth, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /json/);
      postagemMock._id = response.body._id;
      expect(response.body).toEqual(expect.objectContaining({
        _id: expect.any(String),
        titulo: expect.any(String),
        descricao: expect.any(String),
        linguagem: expect.any(String),
        codigo: expect.any(String),
        cor: expect.any(String),
        curtidas_id_usuario: expect.any(Array),
        mensagem: expect.any(Array),
      }));
    });
    it('acessar postagem por id', async () => {
      const response = await request(server)
        .get(`/postagem/${postagemMock._id}`)
        .auth(auth, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /json/);
      expect(response.body.resultSearched).toEqual(expect.objectContaining({
        /* Colocar o objeto de verificação */
        _id: expect.any(String),
        id_usuario: expect.any(String),
        titulo: expect.any(String),
        descricao: expect.any(String),
        linguagem: expect.any(String),
        codigo: expect.any(String),
        cor: expect.any(String),
        curtidas_id_usuario: expect.any(Array),
        mensagem: expect.any(Array),
      }));
    });
  });
  describe('PUT em PostagemRoutes', () => {
    it('Atualizando Postagem por id', async () => {
      postagemMock.titulo = 'Um novo titulo para teste';
      await request(server)
        .put(`/postagem/${postagemMock._id}`)
        .send({ titulo: postagemMock.titulo })
        .auth(auth, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ message: `id: ${postagemMock._id} foi atualizado com sucesso` });
      const response = await request(server)
        .get(`/postagem/${postagemMock._id}`)
        .auth(auth, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /json/);
      expect(response.body.resultSearched.titulo).toEqual(postagemMock.titulo);
    });
  });
  describe('DELETE em PostagemRoutes', () => {
    it('deletar Postagem por id', async () => {
      await request(server)
        .delete(`/postagem/${postagemMock._id}`)
        .auth(auth, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ message: `id: ${postagemMock._id} foi deletado com sucesso` });
    });
  });
});
