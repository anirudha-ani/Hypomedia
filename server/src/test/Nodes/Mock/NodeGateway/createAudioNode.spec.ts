import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendNodeGateway } from '../../../../nodes'
import { INode, makeINodePath, makeINode } from '../../../../types'

describe('Unit Test: Create Node', () => {
  let uri: string
  let mongoClient: MongoClient
  let backendNodeGateway: BackendNodeGateway
  let mongoMemoryServer: MongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendNodeGateway = new BackendNodeGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await backendNodeGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts valid audio node', async () => {
    const validNode: INode = makeINode('1', ['1'], undefined, 'audio')
    const response = await backendNodeGateway.createNode(validNode)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(validNode)
  })

  test('fails to insert node with duplicate id', async () => {
    const validNode: INode = makeINode('1', ['1'], undefined, 'audio')
    const validResponse = await backendNodeGateway.createNode(validNode)

    expect(validResponse.success).toBeTruthy()
    const invalidNode: INode = makeINode('1', ['1'], undefined, 'audio')
    const invalidResponse = await backendNodeGateway.createNode(invalidNode)
    expect(invalidResponse.success).toBeFalsy()
  })

  test('fails to insert node when children is of invalid type', async () => {
    const invalidNode: INode = makeINode('1', ['2'], '')
    const response = await backendNodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when title is of invalid type', async () => {
    const invalidNode = makeINode('1', ['2'], undefined, 'audio', 1)
    const response = await backendNodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when content is not valid typed', async () => {
    const invalidNode = makeINode('1', ['2'], undefined, 'audio', undefined, 0)
    const response = await backendNodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when fieldName is missing', async () => {
    const invalidNode = {
      title: 'invalidNode',
      nodeId: '1',
      type: 'audio',
      filePath: makeINodePath(['1']),
    }
    const response = await backendNodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when fieldName is misnamed', async () => {
    const invalidNode = {
      title: 'invalidNode',
      nodeId: '1',
      type: 'audio',
      asdfasdf: '',
      filePath: makeINodePath(['1']),
    }
    const response = await backendNodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when field value is mistyped', async () => {
    const invalidNode = {
      title: 'invalidNode',
      nodeId: '1',
      type: 'audio',
      content: 1,
      filePath: makeINodePath(['1']),
    }
    const response = await backendNodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })
})
